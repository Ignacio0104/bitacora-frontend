// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDtlihxe1m6VUQCScQnht7zsg_w7jWguZ4',
  authDomain: 'bitacora-platform.firebaseapp.com',
  projectId: 'bitacora-platform',
  storageBucket: 'bitacora-platform.firebasestorage.app',
  messagingSenderId: '587430868360',
  appId: '1:587430868360:web:e171c0a974970f9fdb363d',
  measurementId: 'G-SQEQLG75TS',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
