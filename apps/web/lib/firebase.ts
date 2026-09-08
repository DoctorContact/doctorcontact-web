"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, type ConfirmationResult } from "firebase/auth";

// Public, client-safe config — NOT the same as the backend's service account
// key. From Firebase Console -> Project Settings -> General -> "Your apps" ->
// Web app -> SDK setup and configuration.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

export type { ConfirmationResult };
export { RecaptchaVerifier };
