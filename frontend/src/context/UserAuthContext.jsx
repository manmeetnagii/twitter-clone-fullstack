import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { auth } from "./firebase.js";

const userAuthContext = createContext();

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState({});

  function logIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function loginWithPhone(auth, phoneNumber) {
    return signInWithPhoneNumber(auth, phoneNumber);
  }

  function logOut() { 
    return signOut(auth);
  }

  function googleSignIn() {
    const googleAuthProvider = new GoogleAuthProvider();
    return signInWithPopup(auth, googleAuthProvider);
  }

  function resetPassword(auth, email) {
    return sendPasswordResetEmail(auth, email);
  }

  const setUpRecaptha = async (number) => {
    try {
      const recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: (response) => {
            console.log('Recaptcha resolved');
          },
        }
      );
      recaptchaVerifier.render();

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        number,
        recaptchaVerifier
      );

      sessionStorage.setItem('confirmationResult', JSON.stringify(confirmationResult));
    } catch (error) {
      console.error('Error during phone number sign-in:', error);
    }
  };
  


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentuser) => {
      console.log("Auth", currentuser);
      setUser(currentuser);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <userAuthContext.Provider
      value={{
        auth,
        user,
        logIn,
        signUp,
        loginWithPhone,
        logOut,
        googleSignIn,
        resetPassword,
        setUpRecaptha
      }}
    >
      {children}
    </userAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthContext);
}
