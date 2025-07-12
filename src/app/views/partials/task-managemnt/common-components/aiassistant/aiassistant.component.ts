import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
import { ModalService } from 'src/app/core/utilities/modal';
import { Router } from '@angular/router';
import { TaskMemberAuthService } from 'src/app/services/task-member-auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';

// ! this service for automaticalyy open the modal of ai action types
import { ModalCommunicationService } from 'src/app/services/modal-communication.service';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface AIResponse {
  status: number;
  message: string;
  data?: {
    action_type: string;
    keywords: {
      report_type?: string;
      member_name?: string;
      [key: string]: any;
    };
    missing_keywords: string[];
    extra_keywords: string[];
  };
}

@Component({
  selector: 'app-aiassistant',
  templateUrl: './aiassistant.component.html',
  styleUrl: './aiassistant.component.scss',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AiassistantComponent implements OnInit, OnDestroy {
  // Modal states
  isWelcomeModalOpen = false;
  isInteractionModalOpen = false;
  
  // Speech states
  isListening = false;
  recognizedText = '';
  isProcessing = false;
  isSpeaking = false;
  
  // API states
  isApiCallInProgress = false;
  
  // NEW: Track if user has had any interaction
  hasHadInteraction = false;
  
  // NEW: Track API cancellation
  private currentApiRequest: any = null;
  private shouldCancelProcessing = false;
  private abortController: AbortController | null = null;
  
  // Enhanced timeout handling for continuous listening
  private speechTimeout: any = null;
  private finalTranscript = '';
  private currentSpeechPromise: Promise<void> | null = null;
  private silenceTimeout: any = null; // NEW: For handling silence
  private continuousListening = false; // NEW: Track continuous mode
  
  private recognition: SpeechRecognition | null = null;
  private speechSynthesis = window.speechSynthesis;

  constructor(
    private storage: AppStorage,
    private modal: ModalService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private TaskMemberAuthService: TaskMemberAuthService,
    private modalCommunicationService: ModalCommunicationService
  ) {}

  ngOnInit() {
    this.initializeSpeechRecognition();
  }

  ngOnDestroy() {
    if (this.recognition) {
      this.recognition.abort();
    }
    
    // Clear all timeouts
    if (this.speechTimeout) {
      clearTimeout(this.speechTimeout);
      this.speechTimeout = null;
    }
    
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
    
    this.speechSynthesis.cancel();
  }

  private initializeSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      swalHelper.showToast('Speech Recognition not supported in this browser', 'error');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.cdr.markForCheck();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.cdr.markForCheck();
      
      // Auto-restart if in continuous listening mode and not processing
      if (this.continuousListening && this.isInteractionModalOpen && !this.isApiCallInProgress && !this.isProcessing) {
        setTimeout(() => {
          if (this.continuousListening && this.recognition && !this.isListening) {
            try {
              this.recognition.start();
            } catch (error) {
              console.log('Auto-restart failed, stopping continuous mode');
              this.continuousListening = false;
            }
          }
        }, 100);
      } else if (this.finalTranscript.trim() && !this.isApiCallInProgress) {
        this.processVoiceCommand(this.finalTranscript.trim());
      }
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      this.finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          this.finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      this.recognizedText = (this.finalTranscript + interimTranscript).trim();
      this.cdr.markForCheck();

      // Clear previous silence timeout
      if (this.silenceTimeout) {
        clearTimeout(this.silenceTimeout);
      }

      // Set new silence timeout for 5 seconds
      if (this.recognizedText.length > 0) {
        this.silenceTimeout = setTimeout(() => {
          if (this.isListening && !this.isApiCallInProgress && this.recognizedText.trim()) {
            console.log('5 seconds of silence detected, processing current text...');
            this.continueToProcceed();
          }
        }, 5000); // 5 seconds silence detection
      }
    };

    this.recognition.onerror = (event: any) => {
      switch (event.error) {
        case 'network':
        case 'no-speech':
          // Ignore harmless errors in continuous mode
          break;
        case 'not-allowed':
          swalHelper.showToast('Microphone permission denied. Please allow microphone access.', 'error');
          this.continuousListening = false;
          break;
        case 'audio-capture':
          swalHelper.showToast('No microphone found or audio capture failed', 'error');
          this.continuousListening = false;
          break;
        default:
          break;
      }
      
      if (event.error !== 'network' && event.error !== 'no-speech') {
        this.isListening = false;
        this.isProcessing = false;
        this.isApiCallInProgress = false;
        this.continuousListening = false;
        
        if (this.speechTimeout) {
          clearTimeout(this.speechTimeout);
          this.speechTimeout = null;
        }
        
        if (this.silenceTimeout) {
          clearTimeout(this.silenceTimeout);
          this.silenceTimeout = null;
        }
        
        this.cdr.markForCheck();
      }
    };
  }

  // NEW: Direct interaction without welcome modal
  openDirectInteraction() {
    this.isInteractionModalOpen = true;
    this.recognizedText = '';
    this.finalTranscript = '';
    this.isProcessing = false;
    this.isApiCallInProgress = false;
    this.continuousListening = false;
    this.shouldCancelProcessing = false; // Reset cancellation flag
    this.hasHadInteraction = true; // CHANGE 2: Set this immediately to prevent "I'm ready to help" message
    this.cdr.markForCheck();
    
    // CHANGE 2: Immediately start listening without any delay or greeting
    this.startListening();
  }

  // Keep original methods for backward compatibility
  openWelcomeModal() {
    this.openDirectInteraction(); // Redirect to direct interaction
  }

  closeWelcomeModal() {
    this.isWelcomeModalOpen = false;
    this.speechSynthesis.cancel();
    this.cdr.markForCheck();
  }

  openInteractionModal() {
    this.openDirectInteraction(); // Redirect to direct interaction
  }

  // Enhanced close modal with proper cleanup
  closeInteractionModal() {
    // CHANGE 4: Immediately stop all processes
    this.shouldCancelProcessing = true;
    
    // Cancel any ongoing API request properly
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    
    if (this.currentApiRequest) {
      // For Angular HTTP requests, use unsubscribe if it's a subscription
      if (this.currentApiRequest.unsubscribe) {
        this.currentApiRequest.unsubscribe();
      }
      this.currentApiRequest = null;
    }
    
    // Stop any ongoing speech first
    this.stopCurrentSpeech();
    
    this.isInteractionModalOpen = false;
    this.isListening = false;
    this.recognizedText = '';
    this.finalTranscript = '';
    this.isProcessing = false;
    this.isApiCallInProgress = false;
    this.isSpeaking = false;
    this.continuousListening = false; // Stop continuous mode
    this.hasHadInteraction = false; // Reset interaction state when closing modal
    this.shouldCancelProcessing = false; // Reset cancellation flag
    
    // Clear all timeouts
    if (this.speechTimeout) {
      clearTimeout(this.speechTimeout);
      this.speechTimeout = null;
    }
    
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
    
    if (this.recognition) {
      this.recognition.abort();
    }
    this.speechSynthesis.cancel();
    
    this.cdr.markForCheck();
    console.log('🚪 Modal closed - all speech and processes stopped');
  }

  // Enhanced start listening with continuous mode
  startListening() {
    if (!this.recognition || this.isApiCallInProgress) {
      console.error('Speech recognition not initialized or API call in progress');
      return;
    }

    // Clear any existing timeouts
    if (this.speechTimeout) {
      clearTimeout(this.speechTimeout);
      this.speechTimeout = null;
    }
    
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }

    this.finalTranscript = '';
    this.recognizedText = '';
    this.continuousListening = true; // Enable continuous mode

    try {
      if (this.isListening) {
        console.log('Already listening, stopping first...');
        this.recognition.stop();
        
        setTimeout(() => {
          this.recognition?.start();
        }, 100);
      } else {
        this.recognition.start();
      }
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      
      setTimeout(() => {
        try {
          if (!this.isListening && this.recognition) {
            console.log('Retrying speech recognition...');
            this.recognition.start();
          }
        } catch (retryError) {
          console.error('Retry failed:', retryError);
          swalHelper.showToast('Unable to start speech recognition. Please try again.', 'error');
          this.continuousListening = false;
        }
      }, 500);
    }
  }

  // CHANGE 3: Modified stop mic behavior - no blinking, smooth transition
  stopMicAndReset() {
    // Immediately clear states to prevent blinking
    this.continuousListening = false;
    this.recognizedText = '';
    this.finalTranscript = '';
    this.isProcessing = false;
    this.isApiCallInProgress = false;
    
    // Clear timeouts
    if (this.speechTimeout) {
      clearTimeout(this.speechTimeout);
      this.speechTimeout = null;
    }
    
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
    
    // Stop listening
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
    
    // Force immediate UI update to prevent blinking
    this.cdr.markForCheck();
    
    // Restart listening without any setTimeout to prevent blinking
    if (this.recognition) {
      // Use a very short delay only for speech recognition restart
      setTimeout(() => {
        if (!this.isListening && this.recognition) {
          this.startListening();
        }
      }, 100); // Minimal delay only for speech recognition
    }
    
    console.log('🛑 Mic stopped - restarting listening smoothly');
  }

  // NEW: Continue to Proceed function - completely prevent blinking
  continueToProcceed() {
    if (this.recognizedText.trim() && !this.isApiCallInProgress) {
      // Immediately set processing state to prevent any blinking
      this.isProcessing = true;
      this.isApiCallInProgress = true;
      this.continuousListening = false; // Stop continuous mode
      this.cdr.markForCheck(); // Force immediate UI update
      
      // Clear timeouts
      if (this.silenceTimeout) {
        clearTimeout(this.silenceTimeout);
        this.silenceTimeout = null;
      }
      
      // Stop listening
      if (this.recognition && this.isListening) {
        this.recognition.stop();
      }
      
      // Process the command immediately without any setTimeout
      this.processVoiceCommand(this.recognizedText.trim());
    }
  }

  // CHANGE 4: Stop processing immediately and go back to Start Speaking
  stopProcessingAndReset() {
    // CHANGE 1: Set cancellation flag to stop all processing
    this.shouldCancelProcessing = true;
    
    // Cancel any ongoing API request properly
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    
    if (this.currentApiRequest) {
      // For Angular HTTP requests, use unsubscribe if it's a subscription
      if (this.currentApiRequest.unsubscribe) {
        this.currentApiRequest.unsubscribe();
      }
      this.currentApiRequest = null;
    }
    
    // Stop any ongoing speech
    this.stopCurrentSpeech();
    
    // Reset all states
    this.isProcessing = false;
    this.isApiCallInProgress = false;
    this.isListening = false;
    this.recognizedText = '';
    this.finalTranscript = '';
    this.continuousListening = false;
    this.hasHadInteraction = false; // Reset to show "Start Speaking" screen
    
    // Clear all timeouts
    if (this.speechTimeout) {
      clearTimeout(this.speechTimeout);
      this.speechTimeout = null;
    }
    
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
    
    // Stop recognition
    if (this.recognition) {
      this.recognition.abort();
    }
    
    this.cdr.markForCheck();
    console.log('🛑 Processing stopped completely - returning to Start Speaking');
  }

  // Stop listening manually (legacy method - kept for compatibility)
  stopListening() {
    this.stopMicAndReset();
  }

  // CHANGE 1: Speak text with increased speed
  private speakText(text: string): Promise<void> {
    return new Promise((resolve) => {
      this.speechSynthesis.cancel();
      this.isSpeaking = true;
      this.cdr.markForCheck();
      
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.2; // CHANGED: Increased from 0.7 to 1.2 for faster speech
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.lang = 'en-US';
        
        let speechCompleted = false;
        
        utterance.onstart = () => {
          this.isSpeaking = true;
          this.cdr.markForCheck();
        };
        
        utterance.onend = () => {
          if (!speechCompleted) {
            speechCompleted = true;
            this.isSpeaking = false;
            this.cdr.markForCheck();
            resolve();
          }
        };
        
        utterance.onerror = (e) => {
          if (!speechCompleted) {
            speechCompleted = true;
            this.isSpeaking = false;
            this.cdr.markForCheck();
            resolve();
          }
        };
        
        const estimatedTime = (text.length * 80) + 3000;
        setTimeout(() => {
          if (!speechCompleted) {
            speechCompleted = true;
            this.isSpeaking = false;
            this.cdr.markForCheck();
            resolve();
          }
        }, estimatedTime);
        
        this.speechSynthesis.speak(utterance);
      }, 100);
    });
  }

  // Stop current speech manually
  stopCurrentSpeech(): void {
    this.speechSynthesis.cancel();
    this.isSpeaking = false;
    this.cdr.markForCheck();
  }

  // Enhanced process voice command with proper cancellation support
  private async processVoiceCommand(command: string) {
    this.isProcessing = true;
    this.isApiCallInProgress = true;
    this.continuousListening = false; // Stop continuous mode during processing
    this.shouldCancelProcessing = false; // Reset cancellation flag
    this.cdr.markForCheck();

    try {
      // CHANGE 3: Removed the "Please wait" message - no unnecessary speaking
      
      const teamMemberToken = this.storage.get(teamMemberCommon.TEAM_MEMBER_TOKEN);
      const payload = {
        teamMemberToken: teamMemberToken,
        USER_VOICE_GENERATED_TEXT: command
      };

      // CHANGE 5: Create AbortController for proper cancellation
      this.abortController = new AbortController();
      
      // Store the API request for cancellation - proper way for Angular HTTP
      this.currentApiRequest = this.TaskMemberAuthService.processAICommand(payload);
      const response = await this.currentApiRequest;

      // CHANGE 1: Check if processing was cancelled
      if (this.shouldCancelProcessing) {
        console.log('🛑 Processing was cancelled by user');
        return; // Exit immediately without any response
      }

      if (response && response.success && response.response) {
        
        if (response.response.status === 200) {
          
          if (response.response.data && response.response.data.action_type === 'not_found') {
            // Check cancellation before speaking
            if (!this.shouldCancelProcessing) {
              await this.speakText("I'm sorry Sir, I couldn't understand your request. Could you please try again with a different command or be more specific? I'm here to help you with generating reports, creating tasks, and managing your work efficiently.");
            }
            
          } else {
            // Check cancellation before speaking
            if (!this.shouldCancelProcessing) {
              // Handle modal opening based on action type
              this.handleModalOpening(response.response.data);
            }
          }
          
        } else if (response.response.status === 500) {
          if (!this.shouldCancelProcessing) {
            await this.speakText("I'm experiencing technical difficulties right now, Sir. The server is having issues. Please try again in a few moments, or contact your system administrator if the problem persists.");
          }
          
        } else {
          if (!this.shouldCancelProcessing) {
            await this.speakText(`I encountered an error while processing your request, Sir. The system returned status ${response.response.status}. Please try again later or contact support if this continues.`);
          }
        }
        
      } else {
        if (!this.shouldCancelProcessing) {
          await this.speakText("I'm having trouble communicating with the server right now, Sir. Please check your internet connection and try again.");
        }
      }
      
    } catch (error) {
      // Check if it was cancelled
      if (this.shouldCancelProcessing) {
        console.log('🛑 API request cancelled by user');
        return;
      }
      
      if (!this.shouldCancelProcessing) {
        await this.speakText("I'm unable to connect to the server at the moment, Sir. Please check your internet connection and try again. If the problem continues, please contact your system administrator.");
      }
      
    } finally {
      // Clean up API request reference
      this.currentApiRequest = null;
      this.abortController = null;
      
      // Only close modal if not cancelled
      if (!this.shouldCancelProcessing) {
        this.closeInteractionModal();
      }
    }
  }

  // Handle backdrop click to close modals
  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      if (this.isWelcomeModalOpen) {
        this.closeWelcomeModal();
      } else if (this.isInteractionModalOpen) {
        this.closeInteractionModal();
      }
    }
  }

  // Modal opening handler
  private handleModalOpening(data: any): void {
    if (!data || !data.action_type) {
      return;
    }

    const validActionTypes = ['team_member_add', 'report_generation', 'team_task_creation', 'personal_task_creation'];
    
    if (validActionTypes.includes(data.action_type)) {
      console.log('chandan - Opening modal for action type:', data.action_type);
      
      this.modalCommunicationService.triggerModal({
        actionType: data.action_type,
        keywords: data.keywords || {}
      });
    } else {
      console.log('chandan - Unknown action type, ignoring:', data.action_type);
    }
  }

}