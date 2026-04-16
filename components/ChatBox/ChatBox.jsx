import React, { useContext, useEffect, useState } from 'react'
import './ChatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { toast } from 'react-toastify'
import upload from '../../lib/upload';

const ChatBox = () => {

  const { userData, messagesId, chatUser, messages, setMessages, setChatVisible } = useContext(AppContext);
  const [input, setInput] = useState("");
  const [showReactionFor, setShowReactionFor] = useState(null);

  // ================= SEND TEXT =================
  const sendMessage = async () => {
    try {
      if (!input || !messagesId) return;

      await updateDoc(doc(db, 'messages', messagesId), {
        messages: arrayUnion({
          sId: userData.id,
          text: input,
          createdAt: new Date(),
          seen: false
        })
      });

      setInput("");

    } catch (error) {
      toast.error(error.message);
    }
  };

  // ================= SEND IMAGE =================
  const sendImage = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      const fileUrl = await upload(file);

      if (fileUrl && messagesId) {
        await updateDoc(doc(db, 'messages', messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date(),
            seen: false
          })
        });
      }

    } catch (error) {
      console.log(error);
    }
  };

  // ================= DELETE =================
  const deleteMessage = async (msgIndex) => {
    try {
      const confirmDelete = window.confirm("Delete this message?");
      if (!confirmDelete) return;

      const docRef = doc(db, "messages", messagesId);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        const originalIndex = data.messages.length - 1 - msgIndex;

        const updatedMessages = data.messages.filter(
          (_, index) => index !== originalIndex
        );

        await updateDoc(docRef, {
          messages: updatedMessages
        });
      }

    } catch (error) {
      console.log(error);
    }
  };

  // ================= REACTION =================
  const addReaction = async (msgIndex, emoji) => {
    try {
      const docRef = doc(db, "messages", messagesId);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        const originalIndex = data.messages.length - 1 - msgIndex;

        const updatedMessages = [...data.messages];
        const msg = updatedMessages[originalIndex];

        if (!msg.reactions) msg.reactions = {};

        if (msg.reactions[userData.id] === emoji) {
          delete msg.reactions[userData.id];
        } else {
          msg.reactions[userData.id] = emoji;
        }

        await updateDoc(docRef, {
          messages: updatedMessages
        });
      }

    } catch (error) {
      console.log(error);
    }
  };

  // ================= POPUP =================
  const ReactionPopup = ({ index }) => {
    const emojis = ["👍", "❤️", "😂", "😮", "😢"];

    return (
      <div
        style={{
          position: "absolute",
          bottom: "100%",
          background: "#fff",
          padding: "5px 10px",
          borderRadius: "20px",
          display: "flex",
          gap: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          zIndex: 10
        }}
      >
        {emojis.map((emoji) => (
          <span
            key={emoji}
            style={{ cursor: "pointer", fontSize: "18px" }}
            onClick={() => {
              addReaction(index, emoji);
              setShowReactionFor(null);
            }}
          >
            {emoji}
          </span>
        ))}
      </div>
    );
  };

  // ================= TIME =================
  const convertTimeStamp = (timestamp) => {
    if (!timestamp) return "";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    let hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, "0");

    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;

    return `${hour}:${minute} ${ampm}`;
  };

  // ================= REALTIME =================
  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
        const data = res.data();
        setMessages(data?.messages ? [...data.messages].reverse() : []);
      });

      return () => unSub();
    }
  }, [messagesId]);

  // ================= SEEN =================
  useEffect(() => {
    const markAsSeen = async () => {
      if (!messagesId || !messages.length) return;

      const docRef = doc(db, "messages", messagesId);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();

        const updatedMessages = data.messages.map((msg) => {
          if (msg.sId !== userData.id) {
            return { ...msg, seen: true };
          }
          return msg;
        });

        await updateDoc(docRef, {
          messages: updatedMessages
        });
      }
    };

    markAsSeen();
  }, [messages]);

  return chatUser ? (
    <div className='chat-box'>

      {/* HEADER */}
      <div className="chat-user">
        <img src={chatUser.userData?.avatar || assets.profile_img} alt="" />
        <p>{chatUser.userData?.name}</p>
        <img src={assets.help_icon} className='help' alt="" />
        <img onClick={() => setChatVisible(false)} src={assets.arrow_icon} className='arrow' alt="" />
      </div>

      {/* MESSAGES */}
      <div className='chat-msg'>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sId === userData.id ? "s-msg" : "r-msg"}
            style={{ position: "relative" }}
            onClick={() =>
              setShowReactionFor(showReactionFor === index ? null : index)
            }
          >

            {/* POPUP */}
            {showReactionFor === index && (
              <ReactionPopup index={index} />
            )}

            {/* CONTENT */}
            <div>
              {msg.image
                ? <img className='msg-img' src={msg.image} alt="" />
                : <p className="msg">{msg.text}</p>
              }

              {/* REACTION DISPLAY */}
              {msg.reactions && (
                <div
                  style={{
                    marginTop: "4px",
                    background: "#eee",
                    display: "inline-block",
                    padding: "2px 6px",
                    borderRadius: "12px",
                    fontSize: "14px"
                  }}
                >
                  {Object.values(msg.reactions).join(" ")}
                </div>
              )}
            </div>

            {/* META */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <img
                src={
                  msg.sId === userData.id
                    ? (userData?.avatar || assets.profile_img)
                    : (chatUser.userData?.avatar || assets.profile_img)
                }
                alt=""
              />

              <p>{convertTimeStamp(msg.createdAt)}</p>

              {msg.sId === userData.id && (
                <span>{msg.seen ? "✔✔" : "✔"}</span>
              )}
            </div>

            {/* DELETE */}
            {msg.sId === userData.id && (
              <img
                src={assets.delete_icon}
                alt="delete"
                className="delete-icon"
                onClick={(e) => {
                  e.stopPropagation(); // 🔥 prevent popup
                  deleteMessage(index);
                }}
              />
            )}

          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder='Send a message'
        />

        <input
          type="file"
          id="image"
          hidden
          accept="image/*"
          onChange={sendImage}
        />

        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>

        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>

    </div>
  )
    : (
      <div className='chat-welcome'>
        <img src={assets.logo_icon} alt="" />
        <p>Chat anytime, anywhere</p>
      </div>
    )
}

export default ChatBox;