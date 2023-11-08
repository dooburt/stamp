/* eslint-disable promise/always-return */
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';

// https://www.freecodecamp.org/news/use-firebase-authentication-in-a-react-app/
// https://firebase.google.com/docs/web/setup
const firebaseConfig = {
  apiKey: 'AIzaSyB4hQtPIrKK1bOazqsvaA68tZTiC8vm5jY',
  authDomain: 'stamp-4d7d3.firebaseapp.com',
  databaseURL: 'https://stamp-4d7d3.firebaseapp.com',
  projectId: 'stamp-4d7d3',
  storageBucket: 'stamp-4d7d3.appspot.com',
  messagingSenderId: '391452806509',
  appId: '',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

auth.languageCode = 'en';

const signInGoogle = () => {
  const google = new GoogleAuthProvider();
  google.addScope('https://www.googleapis.com/auth/contacts.readonly');
  google.setCustomParameters({
    login_hint: 'user@example.com',
  });
  signInWithRedirect(auth, google);

  getRedirectResult(auth)
    .then((result) => {
      console.log('result', result);
    })
    .catch((error) => {
      console.error(error);
    });
};

export { auth, signInGoogle };
export default app;
