import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, createContext, useState, useRef } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {

  const navigate = useNavigate();
  const intervalRef = useRef(null);

  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState([]);
  const [messagesId, setMessagesId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);

  const loadUserData = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();

      setUserData(data);

      if (userData?.isProfileComplete) {
  navigate('/chat');
} else {
  navigate('/profile');
}

      await updateDoc(userRef, {
        lastseen: Date.now()
      });

      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(async () => {
        if (auth.currentUser) {
          await updateDoc(userRef, {
            lastseen: Date.now()
          });
        }
      }, 60000);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!userData?.id) return;

    const chatRef = doc(db, 'chats', userData.id);

    const unSub = onSnapshot(chatRef, async (res) => {
      const chatItems = res.data()?.chatsData || [];

      const uniqueMap = new Map();

      for (const item of chatItems) {
        if (
          !uniqueMap.has(item.rId) ||
          item.updatedAt > uniqueMap.get(item.rId).updatedAt
        ) {
          const userRef = doc(db, 'users', item.rId);
          const userSnap = await getDoc(userRef);
          const user = userSnap.data();

          uniqueMap.set(item.rId, { ...item, userData: user });
        }
      }

      const uniqueChats = Array.from(uniqueMap.values());

      setChatData(
        uniqueChats.sort((a, b) => b.updatedAt - a.updatedAt)
      );
    });

    return () => unSub();

  }, [userData]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const value = {
    userData,
    setUserData,
    chatData,
    setChatData,
    loadUserData,
    messages,
    setMessages,
    messagesId,
    setMessagesId,
    chatUser,
    setChatUser,
    chatVisible,
    setChatVisible
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;