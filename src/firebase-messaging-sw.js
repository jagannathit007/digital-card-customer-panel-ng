importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB9qmea4qpahU12U37D0ZrR9RXKOp20n64",
  authDomain: "task-management-d9d1b.firebaseapp.com",
  projectId: "task-management-d9d1b",
  storageBucket: "task-management-d9d1b.firebasestorage.app",
  messagingSenderId: "456015953139",
  appId: "1:456015953139:web:f645f0a44df3b8a1494b86",
  measurementId: "G-003E0M7PZK"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    icon: '/assets/icon.png', 
    badge: '/assets/badge.png' 
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});