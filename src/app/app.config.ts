import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ],
};

// import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { provideAnimations } from '@angular/platform-browser/animations';
// import { routes } from './app.routes';
// import { provideHttpClient } from '@angular/common/http';
// import { provideServiceWorker } from '@angular/service-worker';

// import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
// import { provideMessaging, getMessaging } from '@angular/fire/messaging';
// import { firebaseConfig } from '../env/firebase.config';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideZoneChangeDetection({ eventCoalescing: true }),
//     provideRouter(routes),
//     provideFirebaseApp(() => initializeApp(firebaseConfig)),
//     provideMessaging(() => getMessaging()),
//     provideAnimations(),
//     provideHttpClient(), provideServiceWorker('ngsw-worker.js', {
//             enabled: !isDevMode(),
//             registrationStrategy: 'registerWhenStable:30000'
//           }),
//   ],
// };
