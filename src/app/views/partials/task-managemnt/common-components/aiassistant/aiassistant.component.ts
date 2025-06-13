// import {
//   ChangeDetectionStrategy,
//   Component,
//   OnInit,
//   ChangeDetectorRef,
//   OnDestroy,
// } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { AppStorage } from 'src/app/core/utilities/app-storage';
// import { teamMemberCommon } from 'src/app/core/constants/team-members-common';
// import { ModalService } from 'src/app/core/utilities/modal';
// import { Router } from '@angular/router';
// import { TaskMemberAuthService } from 'src/app/services/task-member-auth.service';
// import { swalHelper } from 'src/app/core/constants/swal-helper';

// interface SpeechRecognitionEvent extends Event {
//   results: SpeechRecognitionResultList;
//   resultIndex: number;
// }

// interface SpeechRecognition extends EventTarget {
//   continuous: boolean;
//   interimResults: boolean;
//   lang: string;
//   start(): void;
//   stop(): void;
//   abort(): void;
//   onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
//   onend: ((this: SpeechRecognition, ev: Event) => any) | null;
//   onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
//   onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
// }

// declare global {
//   interface Window {
//     SpeechRecognition: new () => SpeechRecognition;
//     webkitSpeechRecognition: new () => SpeechRecognition;
//   }
// }

// interface AIResponse {
//   status: number;
//   message: string;
//   data?: {
//     action_type: string;
//     keywords: {
//       report_type?: string;
//       member_name?: string;
//       [key: string]: any;
//     };
//     missing_keywords: string[];
//     extra_keywords: string[];
//   };
// }

// @Component({
//   selector: 'app-aiassistant',
//   templateUrl: './aiassistant.component.html',
//   styleUrl: './aiassistant.component.scss',
//   standalone: true,
//   imports: [CommonModule],
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class AiassistantComponent implements OnInit, OnDestroy {
//   // Modal states
//   isWelcomeModalOpen = false;
//   isInteractionModalOpen = false;
  
//   // Speech states
//   isListening = false;
//   recognizedText = '';
//   isProcessing = false;
  
//   // API states
//   isApiCallInProgress = false;
  
//   // New timeout handling
//   private speechTimeout: any = null;
//   private finalTranscript = '';
  
//   private recognition: SpeechRecognition | null = null;
//   private speechSynthesis = window.speechSynthesis;

//   constructor(
//     private storage: AppStorage,
//     private modal: ModalService,
//     private router: Router,
//     private cdr: ChangeDetectorRef,
//     private TaskMemberAuthService: TaskMemberAuthService
//   ) {}

//   ngOnInit() {
//     this.initializeSpeechRecognition();
//   }

//   ngOnDestroy() {
//     if (this.recognition) {
//       this.recognition.abort();
//     }
    
//     // Clear timeout
//     if (this.speechTimeout) {
//       clearTimeout(this.speechTimeout);
//       this.speechTimeout = null;
//     }
    
//     this.speechSynthesis.cancel();
//   }

//   private initializeSpeechRecognition() {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
//     if (!SpeechRecognition) {
//       console.error('Speech Recognition not supported in this browser');
//       return;
//     }

//     this.recognition = new SpeechRecognition();
//     this.recognition.continuous = true; // Enable continuous listening
//     this.recognition.interimResults = true; // Enable interim results
//     this.recognition.lang = 'en-US';

//     this.recognition.onstart = () => {
//       console.log('Speech recognition started');
//       this.isListening = true;
//       this.finalTranscript = '';
//       this.recognizedText = '';
//       this.cdr.markForCheck();
//     };

//     this.recognition.onend = () => {
//       console.log('Speech recognition ended');
//       this.isListening = false;
//       this.cdr.markForCheck();
      
//       // Only process if we have some text and not already processing
//       if (this.finalTranscript.trim() && !this.isApiCallInProgress) {
//         this.processVoiceCommand(this.finalTranscript.trim());
//       }
//     };

//     this.recognition.onresult = (event: SpeechRecognitionEvent) => {
//       let interimTranscript = '';
//       this.finalTranscript = '';

//       for (let i = event.resultIndex; i < event.results.length; i++) {
//         const transcript = event.results[i][0].transcript;
//         if (event.results[i].isFinal) {
//           this.finalTranscript += transcript;
//         } else {
//           interimTranscript += transcript;
//         }
//       }

//       // Update displayed text with both final and interim results
//       this.recognizedText = (this.finalTranscript + interimTranscript).trim();
//       this.cdr.markForCheck();

//       // Clear any existing timeout
//       if (this.speechTimeout) {
//         clearTimeout(this.speechTimeout);
//       }

//       // Set new timeout if we have some speech
//       if (this.recognizedText.length > 0) {
//         this.speechTimeout = setTimeout(() => {
//           if (this.isListening && !this.isApiCallInProgress) {
//             this.stopListening();
//           }
//         }, 3000); // 3 seconds timeout after last speech
//       }

//       console.log('Interim:', interimTranscript);
//       console.log('Final:', this.finalTranscript);
//     };

//     this.recognition.onerror = (event: any) => {
//       console.error('Speech recognition error:', event.error);
//       this.isListening = false;
//       this.isProcessing = false;
//       this.isApiCallInProgress = false;
      
//       // Clear timeout on error
//       if (this.speechTimeout) {
//         clearTimeout(this.speechTimeout);
//         this.speechTimeout = null;
//       }
      
//       this.cdr.markForCheck();
//     };
//   }

//   // Open welcome modal and speak greeting
//   openWelcomeModal() {
//     this.isWelcomeModalOpen = true;
//     this.cdr.markForCheck();
    
//     // Speak greeting automatically
//     setTimeout(() => {
//       this.speakText("What can I help you with today, Sir.");
//     }, 500);
//   }

//   // Close welcome modal
//   closeWelcomeModal() {
//     this.isWelcomeModalOpen = false;
//     this.speechSynthesis.cancel();
//     this.cdr.markForCheck();
//   }

//   // Open interaction modal and start listening
//   openInteractionModal() {
//     this.isWelcomeModalOpen = false;
//     this.isInteractionModalOpen = true;
//     this.recognizedText = '';
//     this.finalTranscript = '';
//     this.isProcessing = false;
//     this.isApiCallInProgress = false;
//     this.cdr.markForCheck();
//   }

//   // Close interaction modal
//   closeInteractionModal() {
//     this.isInteractionModalOpen = false;
//     this.isListening = false;
//     this.recognizedText = '';
//     this.finalTranscript = '';
//     this.isProcessing = false;
//     this.isApiCallInProgress = false;
    
//     // Clear any timeouts
//     if (this.speechTimeout) {
//       clearTimeout(this.speechTimeout);
//       this.speechTimeout = null;
//     }
    
//     if (this.recognition) {
//       this.recognition.abort();
//     }
//     this.speechSynthesis.cancel();
    
//     this.cdr.markForCheck();
//   }

//   // Start listening for voice command
//   startListening() {
//     if (!this.recognition || this.isApiCallInProgress) {
//       console.error('Speech recognition not initialized or API call in progress');
//       return;
//     }

//     // Clear any existing timeout
//     if (this.speechTimeout) {
//       clearTimeout(this.speechTimeout);
//       this.speechTimeout = null;
//     }

//     this.finalTranscript = '';
//     this.recognizedText = '';

//     try {
//       this.recognition.start();
//     } catch (error) {
//       console.error('Error starting speech recognition:', error);
//     }
//   }

//   // Stop listening manually
//   stopListening() {
//     if (this.recognition && this.isListening) {
//       // Clear timeout
//       if (this.speechTimeout) {
//         clearTimeout(this.speechTimeout);
//         this.speechTimeout = null;
//       }
      
//       this.recognition.stop();
//     }
//   }

//   // FIXED: Speak text using speech synthesis with Promise
//   private speakText(text: string): Promise<void> {
//     return new Promise((resolve) => {
//       this.speechSynthesis.cancel();
      
//       const utterance = new SpeechSynthesisUtterance(text);
//       utterance.rate = 0.9;
//       utterance.pitch = 1;
//       utterance.volume = 1;
      
//       // Try to use English voice
//       const voices = this.speechSynthesis.getVoices();
//       const preferredVoice = voices.find(voice => voice.lang.includes('hi'));
//       if (preferredVoice) {
//         utterance.voice = preferredVoice;
//       }
      
//       // IMPORTANT: Wait for speech to complete before resolving
//       utterance.onend = () => {
//         console.log('Speech completed');
//         resolve();
//       };
      
//       utterance.onerror = () => {
//         console.log('Speech error');
//         resolve();
//       };
      
//       this.speechSynthesis.speak(utterance);
//     });
//   }

//   // FIXED: Process voice command with proper async handling
//   private async processVoiceCommand(command: string) {
//     console.log('Processing command:', command);

//     // Set processing state
//     this.isProcessing = true;
//     this.isApiCallInProgress = true;
//     this.cdr.markForCheck();

//     // Speak processing message and WAIT for it to complete
//     await this.speakText("Please wait Sir, I'm working on your request...");

//     try {
//       // Get team member token
//       const teamMemberToken = this.storage.get(teamMemberCommon.TEAM_MEMBER_TOKEN);

//       // Prepare API payload
//       const payload = {
//         teamMemberToken: teamMemberToken,
//         USER_VOICE_GENERATED_TEXT: command
//       };

//       // Make API call using service
//       const response = await this.TaskMemberAuthService.processAICommand(payload);

//       // Handle API response
//       if (response && response.success && response.response) {
        
//         if (response.response.status === 200) {
//           // SUCCESS CASE - Status 200
//           console.log('API Response Data:', response.response.data);
          
//           // Check if action_type is "not_found"
//           if (response.response.data && response.response.data.action_type === 'not_found') {
//             // NOT FOUND CASE - Speak full message and wait
//             await this.speakText("I'm sorry Sir, I couldn't understand your request. Could you please try again with a different command or be more specific? I'm here to help you with generating reports, creating tasks, and managing your work efficiently.");
            
//             console.log('Action Type: not_found - User command not recognized');
            
//           } else {
//             // NORMAL SUCCESS CASE - Speak API message and wait
//             await this.speakText(response.response.message);
            
//             // Show success swal notification
//             swalHelper.success(response.response.message);
            
//             console.log('Action Type:', response.response.data?.action_type);
//             console.log('Full Response Data:', response.response.data);
//           }
          
//         } else if (response.response.status === 500) {
//           // SERVER ERROR CASE - Status 500
//           await this.speakText("I'm experiencing some technical difficulties right now, Sir. The server is having issues. Please try again in a few moments, or contact your system administrator if the problem persists.");
          
//           console.log('Server Error - Status 500:', response.response.message);
          
//         } else {
//           // OTHER ERROR CASES
//           await this.speakText(`I encountered an error while processing your request, Sir. The system returned status ${response.response.status}. Please try again later or contact support if this continues.`);
          
//           console.log(`API Error - Status ${response.response.status}:`, response.response.message);
//         }
        
//       } else {
//         // RESPONSE STRUCTURE ERROR
//         await this.speakText("I'm having trouble communicating with the server right now, Sir. Please check your internet connection and try again.");
        
//         console.log('Invalid response structure:', response);
//       }
      
//     } catch (error) {
//       // NETWORK/EXCEPTION ERROR
//       console.error('API call failed:', error);
//       await this.speakText("I'm unable to connect to the server at the moment, Sir. Please check your internet connection and try again. If the problem continues, please contact your system administrator.");
      
//     } finally {
//       // Reset processing state
//       this.isProcessing = false;
//       this.isApiCallInProgress = false;
//       this.cdr.markForCheck();
      
//       // IMPORTANT: Close modal ONLY after speech is completely finished
//       setTimeout(() => {
//         this.closeInteractionModal();
//       }, 1000); // Small delay to ensure everything is complete
//     }
//   }

//   // Handle backdrop click to close modals
//   onBackdropClick(event: Event) {
//     if (event.target === event.currentTarget) {
//       if (this.isWelcomeModalOpen) {
//         this.closeWelcomeModal();
//       } else if (this.isInteractionModalOpen) {
//         this.closeInteractionModal();
//       }
//     }
//   }
// }


// !  this is testing modal if please dont remove the comment code

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
  
  // API states
  isApiCallInProgress = false;
  
  // New timeout handling
  private speechTimeout: any = null;
  private finalTranscript = '';
  
  private recognition: SpeechRecognition | null = null;
  private speechSynthesis = window.speechSynthesis;

  constructor(
    private storage: AppStorage,
    private modal: ModalService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private TaskMemberAuthService: TaskMemberAuthService
  ) {}

  ngOnInit() {
    this.initializeSpeechRecognition();
  }

  ngOnDestroy() {
    if (this.recognition) {
      this.recognition.abort();
    }
    
    // Clear timeout
    if (this.speechTimeout) {
      clearTimeout(this.speechTimeout);
      this.speechTimeout = null;
    }
    
    this.speechSynthesis.cancel();
  }

  private initializeSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true; // Enable continuous listening
    this.recognition.interimResults = true; // Enable interim results
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      console.log('Speech recognition started');
      this.isListening = true;
      this.finalTranscript = '';
      this.recognizedText = '';
      this.cdr.markForCheck();
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended');
      this.isListening = false;
      this.cdr.markForCheck();
      
      // Only process if we have some text and not already processing
      if (this.finalTranscript.trim() && !this.isApiCallInProgress) {
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

      // Update displayed text with both final and interim results
      this.recognizedText = (this.finalTranscript + interimTranscript).trim();
      this.cdr.markForCheck();

      // Clear any existing timeout
      if (this.speechTimeout) {
        clearTimeout(this.speechTimeout);
      }

      // Set new timeout if we have some speech
      if (this.recognizedText.length > 0) {
        this.speechTimeout = setTimeout(() => {
          if (this.isListening && !this.isApiCallInProgress) {
            this.stopListening();
          }
        }, 3000); // 3 seconds timeout after last speech
      }

      console.log('Interim:', interimTranscript);
      console.log('Final:', this.finalTranscript);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      this.isProcessing = false;
      this.isApiCallInProgress = false;
      
      // Clear timeout on error
      if (this.speechTimeout) {
        clearTimeout(this.speechTimeout);
        this.speechTimeout = null;
      }
      
      this.cdr.markForCheck();
    };
  }

  // Open welcome modal and speak greeting
  openWelcomeModal() {
    this.isWelcomeModalOpen = true;
    this.cdr.markForCheck();
    
    // Speak greeting automatically
    setTimeout(() => {
      this.speakText("What can I help you with today, Sir.");
    }, 500);
  }

  // Close welcome modal
  closeWelcomeModal() {
    this.isWelcomeModalOpen = false;
    this.speechSynthesis.cancel();
    this.cdr.markForCheck();
  }

  // Open interaction modal and start listening
  openInteractionModal() {
    this.isWelcomeModalOpen = false;
    this.isInteractionModalOpen = true;
    this.recognizedText = '';
    this.finalTranscript = '';
    this.isProcessing = false;
    this.isApiCallInProgress = false;
    this.cdr.markForCheck();
  }

  // Close interaction modal
  closeInteractionModal() {
    this.isInteractionModalOpen = false;
    this.isListening = false;
    this.recognizedText = '';
    this.finalTranscript = '';
    this.isProcessing = false;
    this.isApiCallInProgress = false;
    
    // Clear any timeouts
    if (this.speechTimeout) {
      clearTimeout(this.speechTimeout);
      this.speechTimeout = null;
    }
    
    if (this.recognition) {
      this.recognition.abort();
    }
    this.speechSynthesis.cancel();
    
    this.cdr.markForCheck();
  }

  // Start listening for voice command
  startListening() {
    if (!this.recognition || this.isApiCallInProgress) {
      console.error('Speech recognition not initialized or API call in progress');
      return;
    }

    // Clear any existing timeout
    if (this.speechTimeout) {
      clearTimeout(this.speechTimeout);
      this.speechTimeout = null;
    }

    this.finalTranscript = '';
    this.recognizedText = '';

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  }

  // Stop listening manually
  stopListening() {
    if (this.recognition && this.isListening) {
      // Clear timeout
      if (this.speechTimeout) {
        clearTimeout(this.speechTimeout);
        this.speechTimeout = null;
      }
      
      this.recognition.stop();
    }
  }

  // FIXED: Speak text using speech synthesis with Promise
  private speakText(text: string): Promise<void> {
    return new Promise((resolve) => {
      this.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Try to use English voice
      const voices = this.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => voice.lang.includes('en'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // IMPORTANT: Wait for speech to complete before resolving
      utterance.onend = () => {
        console.log('Speech completed');
        resolve();
      };
      
      utterance.onerror = () => {
        console.log('Speech error');
        resolve();
      };
      
      this.speechSynthesis.speak(utterance);
    });
  }

  // FIXED: Process voice command with proper async handling
  private async processVoiceCommand(command: string) {
    console.log('Processing command:', command);

    // Set processing state
    this.isProcessing = true;
    this.isApiCallInProgress = true;
    this.cdr.markForCheck();

    // Speak processing message and WAIT for it to complete
    await this.speakText("Please wait Sir, I'm working on your request...");

    try {
      // Get team member token
      const teamMemberToken = this.storage.get(teamMemberCommon.TEAM_MEMBER_TOKEN);

      // Prepare API payload
      const payload = {
        teamMemberToken: teamMemberToken,
        USER_VOICE_GENERATED_TEXT: command
      };

      // Make API call using service
      const response = await this.TaskMemberAuthService.processAICommand(payload);

      // Handle API response
      if (response && response.success && response.response) {
        
        if (response.response.status === 200) {
          // SUCCESS CASE - Status 200
          console.log('API Response Data:', response.response.data);
          
          // Check if action_type is "not_found"
          if (response.response.data && response.response.data.action_type === 'not_found') {
            // NOT FOUND CASE - Speak full message and wait
            await this.speakText("I'm sorry Sir, I couldn't understand your request. Could you please try again with a different command or be more specific? I'm here to help you with generating reports, creating tasks, and managing your work efficiently.");
            
            console.log('Action Type: not_found - User command not recognized');
            
          } else {
            // NORMAL SUCCESS CASE - Speak API message and wait
            await this.speakText(response.response.message);
            
            // Show success swal notification
            swalHelper.success(response.response.message);
            
            console.log('Action Type:', response.response.data?.action_type);
            console.log('Full Response Data:', response.response.data);
          }
          
        } else if (response.response.status === 500) {
          // SERVER ERROR CASE - Status 500
          await this.speakText("I'm experiencing some technical difficulties right now, Sir. The server is having issues. Please try again in a few moments, or contact your system administrator if the problem persists.");
          
          console.log('Server Error - Status 500:', response.response.message);
          
        } else {
          // OTHER ERROR CASES
          await this.speakText(`I encountered an error while processing your request, Sir. The system returned status ${response.response.status}. Please try again later or contact support if this continues.`);
          
          console.log(`API Error - Status ${response.response.status}:`, response.response.message);
        }
        
      } else {
        // RESPONSE STRUCTURE ERROR
        await this.speakText("I'm having trouble communicating with the server right now, Sir. Please check your internet connection and try again.");
        
        console.log('Invalid response structure:', response);
      }
      
    } catch (error) {
      // NETWORK/EXCEPTION ERROR
      console.error('API call failed:', error);
      await this.speakText("I'm unable to connect to the server at the moment, Sir. Please check your internet connection and try again. If the problem continues, please contact your system administrator.");
      
    } finally {
      // Reset processing state
      this.isProcessing = false;
      this.isApiCallInProgress = false;
      this.cdr.markForCheck();
      
      // IMPORTANT: Close modal ONLY after speech is completely finished
      setTimeout(() => {
        this.closeInteractionModal();
      }, 1000); // Small delay to ensure everything is complete
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
}