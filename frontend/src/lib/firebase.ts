import { initializeApp, getApp, getApps } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAG2gcF3zaXubzeBtqqe86pqlIOvNmXz7I",
  authDomain: "fallyx-dev-dafcb.firebaseapp.com",
  projectId: "fallyx-dev-dafcb",
  storageBucket: "fallyx-dev-dafcb.firebasestorage.app",
  messagingSenderId: "106345548274",
  appId: "1:106345548274:web:5742b46a7c0c57dcf0036b"
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider }