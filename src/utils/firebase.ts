import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDvKroLZoqJzTCcMrSBHGKqZhYTVoY7R2E',
  authDomain: 'rextensions-1d87a.firebaseapp.com',
  projectId: 'rextensions-1d87a',
  storageBucket: 'rextensions-1d87a.firebasestorage.app',
  messagingSenderId: '1076415115451',
  appId: '1:1076415115451:web:53f33a0c84b81aafd3799e',
  measurementId: 'G-R6TJDKBW66',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
