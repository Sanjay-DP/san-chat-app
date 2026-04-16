import React, { useContext, useEffect, useState } from 'react'
import './ProfileUpdate.css'
import assets from '../../../assets/assets'
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../../config/firebase';
import { doc, DocumentReference, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import upload from '../../../lib/upload';
import { AppContext } from '../../../context/AppContext';

const ProfileUpdate = () => {

  const navigate = useNavigate();
  const[image, setImage] = useState(false);
  const [name,setName] = useState("");
  const [bio,setBio] = useState("");
  const [uid,setUid] = useState("");
  const [prevImage,setPrevImage] = useState("");
  const { setUserData, userData } = useContext(AppContext);

  const profileUpdate = async (event) => {
  event.preventDefault();

  try {

    if (!name.trim()) {
      toast.error("Enter your name");
      return;
    }

    const docRef = doc(db, 'users', uid);

    let imgUrl = prevImage || ""; //  image optional

    if (image) {
      imgUrl = await upload(image);
    }

    await updateDoc(docRef, {
      avatar: imgUrl,   //  can be empty
      name: name,
      bio: bio,
      isProfileComplete: true,
      lastSeen: Date.now()
    });

    const snap = await getDoc(docRef);
    setUserData(snap.data());

    navigate('/chat'); // always go to chat

  } catch (error) {
    console.error(error);
    toast.error(error.message);
  }
};

  useEffect(()=>{
    onAuthStateChanged(auth,async (user)=>{
      if(user){
        setUid(user.uid);
        const docRef = doc(db,"users",user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.data().name) {
          setName(docSnap.data().name);
        }
        if (docSnap.data().bio) {
          setBio(docSnap.data().bio);
        }
        if (docSnap.data().avatar) {
          setPrevImage((await docSnap).data().avatar)
        }
      }
      else{
        navigate('/')
      }
    })

  },[])

  useEffect(() => {
  if (userData?.isProfileComplete) {
    navigate('/chat');
  }
}, [userData]);

  return (
    <div className='profile'>
      <div className="profile-container">
        <form onSubmit={profileUpdate}> 
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input onChange={(e)=>setImage(e.target.files[0])} type="file" id='avatar' accept='.png, .jpg, .jpeg' hidden/>
            <img src={image? URL.createObjectURL(image) :assets.avatar_icon} alt="" />
            upload profile picture
          </label>
          <input onChange={(e)=> setName(e.target.value)} value={name} type="text" placeholder='Your Name' required/>
          <textarea onChange={(e)=> setBio(e.target.bio)} value={bio} placeholder='Write profile bio' required></textarea>
          <button type="submit">Save</button>
        </form>
        <img className='profile-pic' src={image? URL.createObjectURL(image):prevImage ? prevImage : assets.logo_icon} alt="" />
      </div>
      
    </div>
  )
}

export default ProfileUpdate
