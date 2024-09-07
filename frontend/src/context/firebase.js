import { initializeApp } from "firebase/app";
import{getAuth} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyASdT8OslHIDRT_vtJQAvX3T8kZyvx-bvw",
  authDomain: "twitter-clone-3287a.firebaseapp.com",
  projectId: "twitter-clone-3287a",
  storageBucket: "twitter-clone-3287a.appspot.com",
  messagingSenderId: "662732993999",
  appId: "1:662732993999:web:cb86c082fb9acd63ed4eba"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app;