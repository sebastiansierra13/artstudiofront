import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';



export const appConfig: ApplicationConfig = {
  providers: [provideAnimations(), provideHttpClient(withFetch()),provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(), provideFirebaseApp(() => initializeApp({"projectId":"fireartstudio-8586e","appId":"1:954363151421:web:b07390c32980b856319654","databaseURL":"https://fireartstudio-8586e-default-rtdb.firebaseio.com","storageBucket":"fireartstudio-8586e.appspot.com","apiKey":"AIzaSyBaUGD7sYpO6PwDmLOZEcCf0DXo3XyYsQk","authDomain":"fireartstudio-8586e.firebaseapp.com","messagingSenderId":"954363151421","measurementId":"G-8WBJPS0F2J"})), provideFirestore(() => getFirestore()), provideStorage(() => getStorage())  ]
};
