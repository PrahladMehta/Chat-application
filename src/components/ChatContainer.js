import React,{useEffect,useState,useRef} from 'react'
import styled from 'styled-components';
import Logout from './Logout';
import ChatInput from './ChatInput';
import Message from "./Message"
import { sendMessageRoute } from '../utils/Apiroutes';
import axios from 'axios';

import {  getAllMessageRoute} from '../utils/Apiroutes';
import {v4 as uuidv4} from "uuid";
const ChatContainer = ({currChat,currUser,socket}) => {
     const scrollRef=useRef();
      const[arrivalMessage,setArrivalMessage]=useState(null);
       const [messages,setMessages]=useState([]);
     
      const getChat=async()=>{
            
            const response=await axios.post(getAllMessageRoute,{
                  from:currUser._id,
                  to:currChat._id,
            });
            setMessages(response.data);   

      }


      useEffect(()=>{

            if(currChat){
                  getChat();
            }
         

      },[currChat]);

      const handleSendMes=async (msg)=>{

         

            await axios.post(sendMessageRoute,{
                  from:currUser._id,
                  to:currChat._id,
                  message:msg
            });
            socket.current.emit("send-msg",{
                  from:currUser._id,
                  to:currChat._id,
                  message:msg
            })

            const msgs=[...messages];
            
            msgs.push({fromSelf:true,message:msg})
            setMessages(msgs);
 
      }

      useEffect(()=>{
            if(socket.current){
                  socket.current.on("msg-recieve",(msg)=>{
                       
                        setArrivalMessage({fromSelf:false,message:msg})
                  })
            }
      },[])

      useEffect(()=>{

            arrivalMessage&& setMessages((prev)=>[...prev,arrivalMessage]);

      },[arrivalMessage]);

      useEffect(()=>{
            scrollRef.current?.scrollIntoView({behaviour:"smooth"})
      },[messages])
  return (

      <>
    {
      currChat&&(
            <Container >
            <div className="chat-header">
                  <div className="user-details">
                        <div className="avatar">  <img  src={`data:image/svg+xml;base64,${currChat.avatarImage}`} alt="avatar"  /></div>
                        <div className="username">
                              <h3>{
                                    currChat.usename
                              }</h3>
                        </div>
                  </div>
                  <Logout></Logout>
            </div>
            <div className="chat-messages">
                  {
                        messages.map((message,idx)=>{
                            
                              return (
                                    <div key={uuidv4()} ref={scrollRef} >
                                          <div className={`message ${message.fromSelf ? 'sended' : 'recieved' }`}>
                                                <div className="content">{
                                                      message.message
                                                }</div>
                                          </div>
                                    </div>
                              )
                        })
                  }
            </div>
            {/* <Message></Message> */}
           <ChatInput handleSendMes={handleSendMes}></ChatInput>
          </Container>
      )
    }
    </>
  )
}

export default ChatContainer;

const Container=styled.div`

display:grid;
grid-template-rows:10% 80% 8%;
gap:.1rem;
overflow:hidden;

@media screen and (min-width:720px) and (max-width:1080px){
      grid-template-rows:15% 70% 15%;
}

padding:1rem;
.chat-header{
      display:flex;
      justify-content:space-between;
      align-items:center;
      padding:0 2rem;

      .user-details{
            display:flex;
            align-items:center;
            gap:1rem;

            .avatar{
                  img{
                        height:3rem;
                  }
            }

            .username{
                  h3{
                        color:white;
                  }
            }
      }
}

.chat-messages{
      padding:1rem 2rem;
      display:flex;
      flex-direction:column;
      gap:1rem;
      overflow:auto;
      &::-webkit-scrollbar{
            width:0.2rem;
            &-thumb{
                  background-color:#ffffff39;
                  width:.1rem;
                  border-radius:1rem;
            }
      }
      .message{
            display:flex;
            align-items:center;
            
            .content{
                  max-width:40%;
                  overflow-wrap:break-word;
                  padding:1rem;
                  font-size:1.1rem;
                  border-radius:1rem;
                  color:#d1d1d1;
            }
      }
      .sended{
            justify-content:flex-end;
            .content{
                  background-color:#4f04ff21;
            }
      }
      .recieved{
            justify-content:flex-start;
            .content{
                  background-color:#9900ff20;
                  
            }
      }
}


`

