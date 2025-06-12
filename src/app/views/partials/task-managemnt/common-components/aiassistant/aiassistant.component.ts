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

@Component({
  selector: 'app-aiassistant',
  templateUrl: './aiassistant.component.html',
  styleUrl: './aiassistant.component.scss',
  standalone: true,
  imports:[CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AiassistantComponent implements OnInit, OnDestroy {
  isModalOpen = false;
  isListening = false;
  recognizedText = '';
  hasStarted = false; // New property to track if user has clicked start
  isProcessing = false; // New property to track if AI is processing/responding
  
  private recognition: SpeechRecognition | null = null;
  private speechSynthesis = window.speechSynthesis;

  constructor(
    private storage: AppStorage,
    private modal: ModalService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initializeSpeechRecognition();
  }

  ngOnDestroy() {
    if (this.recognition) {
      this.recognition.abort();
    }
    // Cancel any ongoing speech synthesis
    this.speechSynthesis.cancel();
  }

  private initializeSpeechRecognition() {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      console.log('Speech recognition started');
      this.isListening = true;
      this.cdr.markForCheck();
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended');
      this.isListening = false;
      this.cdr.markForCheck();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      console.log('Recognized speech:', transcript);
      
      this.recognizedText = transcript;
      this.isProcessing = true;
      this.cdr.markForCheck();
      
      // Process the recognized speech after a small delay
      setTimeout(() => {
        this.processVoiceCommand(transcript);
      }, 1000);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      this.isProcessing = false;
      this.cdr.markForCheck();
    };
  }

  openModal() {
    this.isModalOpen = true;
    this.recognizedText = '';
    this.hasStarted = false;
    this.isProcessing = false;
    this.cdr.markForCheck();
  }

  closeModal() {
    this.isModalOpen = false;
    this.isListening = false;
    this.recognizedText = '';
    this.hasStarted = false;
    this.isProcessing = false;
    
    // Stop any ongoing recognition or speech
    if (this.recognition) {
      this.recognition.abort();
    }
    this.speechSynthesis.cancel();
    
    this.cdr.markForCheck();
  }

  startListening() {
    if (!this.recognition) {
      console.error('Speech recognition not initialized');
      return;
    }

    // Mark that user has started the conversation
    this.hasStarted = true;
    this.cdr.markForCheck();

    // First speak the greeting
    this.speakText("What can I help you with?");
    
    // Start listening after the greeting is finished
    setTimeout(() => {
      if (this.isListening) {
        console.log('Already listening...');
        return;
      }

      try {
        this.recognition!.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }, 2000); // Wait 2 seconds for greeting to finish
  }

  private speakText(text: string) {
    // Cancel any ongoing speech
    this.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Optional: Set a specific voice (you can customize this)
    const voices = this.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => voice.lang.includes('hi'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onend = () => {
      this.isProcessing = false;
      this.cdr.markForCheck();
    };
    
    this.speechSynthesis.speak(utterance);
  }

  private processVoiceCommand(command: string) {
    console.log('Processing command:', command);
    
    // Define command mappings
    const commandMappings = [
      {
        patterns: ['go to my profile', 'profile page', 'my profile', 'open profile'],
        route: '/task-management/profile',
        response: 'Navigating to your profile page'
      },
      {
        patterns: ['go to dashboard', 'dashboard', 'home page', 'go home'],
        route: '/task-management/dashboard',
        response: 'Navigating to dashboard'
      },
      {
        patterns: ['go to settings', 'settings page', 'open settings'],
        route: '/task-management/profile',
        response: 'Opening settings page'
      },
      {
        patterns: ['go to users', 'users page', 'user management'],
        route: '/task-management/boards',
        response: 'Navigating to users page'
      },
      {
        patterns: ['logout', 'log out', 'sign out'],
        route: '/login',
        response: 'Logging you out'
      }
    ];

    // Find matching command
    const matchedCommand = commandMappings.find(mapping =>
      mapping.patterns.some(pattern => command.includes(pattern))
    );

    if (matchedCommand) {
      // Speak response
      this.speakText(matchedCommand.response);
      
      // Navigate after a short delay
      setTimeout(() => {
        this.router.navigate([matchedCommand.route]);
        this.closeModal();
      }, 2500);
    } else {
      // Handle unrecognized commands
      console.log('Command not recognized:', command);
      this.speakText("I'm sorry, I didn't understand that command. Please try again or click start to try again.");
      
      // Reset after response
      setTimeout(() => {
        this.hasStarted = false;
        this.recognizedText = '';
        this.cdr.markForCheck();
      }, 3000);
    }
  }

  // Handle backdrop click to close modal
  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}