import React, { useContext, useState } from 'react'
import './LeftSidebar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore'
import { db } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'

const LeftSidebar = () => {

  const navigate = useNavigate();

  const { userData, chatData, setChatUser, setMessagesId, chatVisible, setChatVisible } = useContext(AppContext);

  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const inputHandler = async (e) => {
    const input = e.target.value;

    if (!input) {
      setShowSearch(false);
      setUser(null);
      return;
    }

    setShowSearch(true);

    const userRef = collection(db, 'users');
    const q = query(userRef, where("username", "==", input.toLowerCase()));
    const querySnap = await getDocs(q);

    if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {

      const exists = (chatData || []).some(
        (item) => item.rId === querySnap.docs[0].data().id
      );

      if (!exists) setUser(querySnap.docs[0].data());
      else setUser(null);
    } else {
      setUser(null);
    }
  }

  const addChat = async () => {

    const alreadyExists = (chatData || []).some(
      (c) => c.rId === user.id
    );

    if (alreadyExists) {
      toast.info("Chat already exists");
      return;
    }

    const messagesRef = collection(db, "messages");
    const chatsRef = collection(db, "chats");

    const newMessageRef = doc(messagesRef);

    await setDoc(newMessageRef, {
      createdAt: serverTimestamp(),
      messages: []
    });

    await updateDoc(doc(chatsRef, user.id), {
      chatsData: arrayUnion({
        messageId: newMessageRef.id,
        lastMessage: "",
        rId: userData.id,
        updatedAt: Date.now(),
        messageSeen: true
      })
    });

    await updateDoc(doc(chatsRef, userData.id), {
      chatsData: arrayUnion({
        messageId: newMessageRef.id,
        lastMessage: "",
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true
      })
    });

    setMessagesId(newMessageRef.id);
    setChatUser({ rId: user.id, userData: user });
    setChatVisible(true);

    setShowSearch(false);
    setUser(null);
  }

  const setChat = async (item) => {
    setMessagesId(item.messageId);
    setChatUser(item);
    setChatVisible(true);
  }

  return (
    <div className='ls'>

      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className='logo' alt="" />
        </div>

        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input onChange={inputHandler} type="text" placeholder='Search here...' />
        </div>
      </div>

      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={addChat} className='friends add-user'>
            <img src={user.avatar || assets.profile_img} alt="" />
            <p>{user.name}</p>
          </div>
        ) : (
          (chatData || []).map((item) => (
            <div
              key={item.messageId}
              onClick={() => setChat(item)}
              className={`friends ${item.messageSeen ? "" : "border"}`}
            >
              <img src={item.userData?.avatar || assets.profile_img} alt="" />
              <div>
                <p>{item.userData?.name}</p>
                <span>{item.lastMessage}</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  )
}

export default LeftSidebar;