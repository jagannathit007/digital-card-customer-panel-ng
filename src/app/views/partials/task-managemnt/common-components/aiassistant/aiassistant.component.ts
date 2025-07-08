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
    // Don't reset hasHadInteraction here to preserve state
    this.cdr.markForCheck();
    
    // Speak greeting and start listening immediately
    setTimeout(async () => {
      await this.speakText("What can I help you with?");
      // Start listening after greeting
      setTimeout(() => {
        if (this.isInteractionModalOpen) {
          this.startListening();
        }
      }, 500);
    }, 500);
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
    console.log('🚪 Modal closed - all speech stopped');
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

  // NEW: Stop mic and reset to Start Speaking section
  stopMicAndReset() {
    this.continuousListening = false;
    
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
    
    // Reset to Start Speaking state
    this.isListening = false;
    this.recognizedText = '';
    this.finalTranscript = '';
    this.isProcessing = false;
    this.isApiCallInProgress = false;
    
    this.cdr.markForCheck();
    console.log('🛑 Mic stopped - returning to Start Speaking section');
  }

  // NEW: Continue to Proceed function
  continueToProcceed() {
    if (this.recognizedText.trim() && !this.isApiCallInProgress) {
      this.continuousListening = false; // Stop continuous mode
      
      // Clear timeouts
      if (this.silenceTimeout) {
        clearTimeout(this.silenceTimeout);
        this.silenceTimeout = null;
      }
      
      // Stop listening and process
      if (this.recognition && this.isListening) {
        this.recognition.stop();
      }
      
      // Process the command
      this.processVoiceCommand(this.recognizedText.trim());
    }
  }

  // Stop listening manually (legacy method - kept for compatibility)
  stopListening() {
    this.stopMicAndReset();
  }

  // Speak text with completion tracking
  private speakText(text: string): Promise<void> {
    return new Promise((resolve) => {
      this.speechSynthesis.cancel();
      this.isSpeaking = true;
      this.cdr.markForCheck();
      
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.7;
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

  // Enhanced process voice command with auto-close after response
  private async processVoiceCommand(command: string) {
    this.isProcessing = true;
    this.isApiCallInProgress = true;
    this.continuousListening = false; // Stop continuous mode during processing
    this.cdr.markForCheck();

    try {
      await this.speakText("Please wait Sir, I'm working on your request...");

      const teamMemberToken = this.storage.get(teamMemberCommon.TEAM_MEMBER_TOKEN);
      const payload = {
        teamMemberToken: teamMemberToken,
        USER_VOICE_GENERATED_TEXT: command
      };

      const response = await this.TaskMemberAuthService.processAICommand(payload);

      if (response && response.success && response.response) {
        
        if (response.response.status === 200) {
          
          if (response.response.data && response.response.data.action_type === 'not_found') {
            await this.speakText("I'm sorry Sir, I couldn't understand your request. Could you please try again with a different command or be more specific? I'm here to help you with generating reports, creating tasks, and managing your work efficiently.");
            
          } else {
            await this.speakText(response.response.message);

            // Handle modal opening based on action type
            this.handleModalOpening(response.response.data);
          }
          
        } else if (response.response.status === 500) {
          await this.speakText("I'm experiencing technical difficulties right now, Sir. The server is having issues. Please try again in a few moments, or contact your system administrator if the problem persists.");
          
        } else {
          await this.speakText(`I encountered an error while processing your request, Sir. The system returned status ${response.response.status}. Please try again later or contact support if this continues.`);
        }
        
      } else {
        await this.speakText("I'm having trouble communicating with the server right now, Sir. Please check your internet connection and try again.");
      }
      
    } catch (error) {
      await this.speakText("I'm unable to connect to the server at the moment, Sir. Please check your internet connection and try again. If the problem continues, please contact your system administrator.");
      
    } finally {
      // Close modal after any response (success or fail)
      setTimeout(() => {
        this.closeInteractionModal();
      }, 1000); // Small delay to let speech finish
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