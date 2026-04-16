import React, { useContext, useEffect, useState } from 'react'
import './RightSidebar.css'
import assets from '../../assets/assets'
import { logout } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'

const RightSidebar = () => {

  const { chatUser, messages } = useContext(AppContext);
  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    const temp = [];

    messages.forEach((msg) => {
      if (msg.image) temp.push(msg.image);
    });

    setMsgImages(temp);
  }, [messages]);

  return chatUser ? (
    <div className='rs'>
      <div className="rs-profile">
        <img src={chatUser.userData?.avatar || assets.profile_img} alt="" />
        <h3>
          {Date.now() - chatUser.userData?.lastseen <= 70000 &&
            <img src={assets.green_dot} className='dot' alt="" />
          }
          {chatUser.userData?.name}
        </h3>
        <p>{chatUser.userData?.bio || "No bio available"}</p>
      </div>

      <hr />

      <div className="rs-media">
        <p>Media</p>
        <div>
          {msgImages.map((url, index) => (
            <img key={index} onClick={() => window.open(url)} src={url || null} alt='' />
          ))}
        </div>
      </div>

      <button onClick={() => logout()}>Logout</button>
    </div>
  ) : (
    <div className='rs'>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}

export default RightSidebar;