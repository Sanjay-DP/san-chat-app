import React, { useContext, useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Login from './pages/Login/Login/Login'
import Chat from './pages/Login/Chat/Chat'
import ProfileUpdate from './pages/Login/ProfileUpdate/ProfileUpdate'
import { ToastContainer, toast } from 'react-toastify';
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './config/firebase'
import { AppContext } from './context/AppContext'
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
//using navigate hook to navigate between pages
  const navigate = useNavigate();
  const {loadUserData} = useContext(AppContext)

  useEffect(() =>{
    onAuthStateChanged(auth, async (user) => {
      //if we logout no auth and no user will be there and we will navigate to login page
      if (user) {
        navigate('/chat');
        await loadUserData(user.uid)
      }
      else {
        navigate('/');
      }
  })
  },[])


  return (
    <>
    <ToastContainer />
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path="/chat"element={<ProtectedRoute><Chat /></ProtectedRoute>}/>
      <Route path='/profile' element={<ProfileUpdate />} />
      </Routes>      
    </>
  )
}

export default App
