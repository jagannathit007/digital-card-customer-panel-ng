// import { Injectable, inject } from '@angular/core';
// import { Messaging, getToken, isSupported, onMessage } from '@angular/fire/messaging';

// @Injectable({
//   providedIn: 'root'
// })
// export class FcmService {
//   private messaging = inject(Messaging);

//   constructor() {
//     this.registerServiceWorker();
//   }

//   private async registerServiceWorker(): Promise<void> {
//     if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
//       console.warn('❌ Service Worker not supported');
//       return;
//     }

//     try {
//       const supported = await isSupported();
//       if (!supported) {
//         console.warn('❌ FCM not supported on this browser.');
//         return;
//       }

//       // Register the service worker
//       const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
//         scope: '/firebase-cloud-messaging-push-scope'
//       });
      
//       // console.log('✅ Service Worker registered successfully:', registration);
      
//       // Wait for the service worker to be ready
//       await navigator.serviceWorker.ready;
//       // console.log('✅ Service Worker is ready');
      
//     } catch (error) {
//       console.error('❌ Service Worker registration failed:', error);
//     }
//   }

  
// // Alternative simpler approach
// async requestPermissionAndGetTokenSimple(): Promise<string | null> {
//   try {
//     const supported = await isSupported();
//     if (!supported) {
//       console.warn('❌ FCM not supported');
//       return null;
//     }

//     const permission = await Notification.requestPermission();
//     if (permission !== 'granted') {
//       console.warn('❌ Permission denied');
//       return null;
//     }

//     // console.log('✅ Permission granted, getting token...');

//     // Direct token request without waiting for service worker
//     const token = await getToken(this.messaging, {
//       vapidKey: 'BO2vW1qsYVBug_O66EI4BdYsw2gbZt0sUAVCDW8-7iZMtQcNDzb0HY3lGJnxnTYkZoyrEujNZzFPFeOwCnF-4mk'
//     });

//     if (token) {
//       // console.log('✅ Token received:', token);
//       return token;
//     } else {
//       console.warn('❌ No token available');
//       return null;
//     }
//   } catch (error) {
//     console.error('❌ Token error:', error);
//     return null;
//   }
// }

//   listenToMessages(): void {
//     if (typeof window === 'undefined') return;
    
//     onMessage(this.messaging, (payload) => {
//       console.log('📩 Foreground message received:', payload);
      
//       const title = payload.notification?.title || 'Notification';
//       const options = {
//         body: payload.notification?.body || 'New message received',
//         icon: '/assets/icon.png',
//         tag: 'firebase-notification',
//         requireInteraction: true
//       };
      
//       if (Notification.permission === 'granted') {
//         new Notification(title, options);
//       }
//     });
//   }
// }