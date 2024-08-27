import React,{useState,useEffect,useRef} from 'react'
import axios from "axios";
import { allUserRoute,host } from '../utils/Apiroutes';
import { useNavigate } from 'react-router-dom';
import Contact from '../components/Contact';
import Welcome from '../components/Welcome';
import styled from 'styled-components'
import ChatContainer from "../components/ChatContainer"
import {io} from "socket.io-client"
const Chat = () => {
  const socket=useRef();
  const [contacts,setContacts]=useState([]);
  const [currentUser,setCurrentUser]=useState();
  const[currentChat,setCurrentChat]=useState(undefined);
  const[isLoaded,setIsLoaded]=useState(false);
  const nav=useNavigate();
  
  async function fetchData(){

  const user= await JSON.parse(localStorage.getItem("chat-app-user"));
  setCurrentUser(user);

  if(!user.isAvatarImageSet){
    nav("/setAvatar");

  }else{
    await axios.get(`${allUserRoute}/${user._id}`).then((data)=>{setContacts(data.data);setIsLoaded(true)});
  }



  }

  useEffect(()=>{
    if(currentUser){
      socket.current=io(host);
      socket.current.emit("add-user",currentUser._id);
    }

  },[currentUser]);

  function handleChatChange(chat){
    setCurrentChat(chat);


  }

  useEffect(()=>{
    if(!localStorage.getItem("chat-app-user")){
        nav("/login");
    }else{
      fetchData();
    } },[])

  return (

  
<Container>


    <div className="container">
    <Contact contacts={contacts} currentUser={currentUser} chatChange={handleChatChange}></Contact>

    {
      isLoaded&&currentChat===undefined?<Welcome currUser={currentUser}></Welcome>:<ChatContainer currChat={currentChat} currUser={currentUser} socket={socket}></ChatContainer>
    }

 
    </div>

</Container>
  )
}

export default Chat

const Container=styled.div`

    height:100vh;
    width:100vw;
    display:flex;
    ${'' /* flex-direction:column; */}
    gap:1rem;
    align-items:center;
    justify-content:center;
    
    background-color:#131324;
    .container{
      height:85vh;
      width:85vw;
      background-color:#00000076;
      display:grid;
      grid-template-columns:25% 75%;

      @media screen and (min-width:720px) and (max-width:1080px){
        grid-template-columns:35% 65%;
      }

      
    }

`;