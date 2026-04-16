// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// Firebase services
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";

import {
  getFirestore,
  setDoc,
  doc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

// Toast
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyBRu7Sr8qC-dCdgir4r6nutiXL79qUItTI",
  authDomain: "chat-app-gs-4f4cb.firebaseapp.com",
  projectId: "chat-app-gs-4f4cb",
  storageBucket: "chat-app-gs-4f4cb.firebasestorage.app",
  messagingSenderId: "590198333084",
  appId: "1:590198333084:web:3de6060c6a96877f979759"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

//  SIGNUP
const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey, there! I am using Chat App.",
      isProfileComplete: false,
      lastseen: Date.now() // (consistent key)
    });

    await setDoc(doc(db, "chats", user.uid), {
      chatsData: []
    });

    toast.success("Signup successful");

  } catch (error) {
    console.error(error);
    toast.error(error.code?.split('/')[1]?.split('-').join(' ') || error.message);
  }
};

// LOGIN
const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
    toast.error(error.code?.split('/')[1]?.split('-').join(' ') || error.message);
  }
};

// LOGOUT
const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
    toast.error(error.code?.split('/')[1]?.split('-').join(' ') || error.message);
  }
};

// RESET PASSWORD
const resetPass = async (email) => {
  if (!email) {
    toast.error("Enter your email");
    return;
  }

  try {
    const userRef = collection(db, 'users');
    const q = query(userRef, where("email", "==", email));
    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      await sendPasswordResetEmail(auth, email);
      toast.success("Reset email sent");
    } else {
      toast.error("Email does not exist");
    }

  } catch (error) {
    console.error(error);
    toast.error(error.message);
  }
};

export { signup, login, logout, auth, db, resetPass };