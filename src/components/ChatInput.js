import React,{useState}from 'react'
import Picker from "emoji-picker-react";

import styled from 'styled-components';
import {IoMdSend} from "react-icons/io";
import {BsEmojiSmileFill} from "react-icons/bs";
const ChatInput = ({handleSendMes}) => {

  const [showEmojiPicker,setShowEmojiPicker]=useState(false);
  const[mes,setMes]=useState("");

  const handleEmojiPickerHideShow=()=>{

    setShowEmojiPicker(!showEmojiPicker);

  }

  const handleEmojiClick=(event,emoji)=>{

    setMes((prev)=>prev+=event.emoji);
  
  }

  const sentChat=(e)=>{
    e.preventDefault();
    if(mes.length>0){
      handleSendMes(mes);
      setMes('');
    }
  }
  return (
  <Container>
    <div className="button-container">
      <div className="emoji" >
        <BsEmojiSmileFill onClick={handleEmojiPickerHideShow
      }/>

      {
          showEmojiPicker&& <Picker  onEmojiClick={handleEmojiClick} className='emoji-picker-react'
      />
        }

    
      </div>
    </div>

    <form className='input-container' onSubmit={sentChat}>
      <input type="text" placeholder='Message..' value={mes} onChange={(e)=>setMes(e.target.value)} />
      <button className='submit'>
      <IoMdSend/>

      </button>
    </form>
  </Container>
  )
}

export default ChatInput

const Container=styled.div`
display:grid;
grid-template-columns:5% 95%;
aling-items:center;
background-color:#080420;
padding:0 2rem;
padding-bottom:0.3rem;

@media screen and(min-width:720px) and(max-width:1080px){
  padding:0 1rem;
  gap:1rem
}

.button-container{
  display:flex;
  align-items:center;
  color:white;
  gap:1rem;

  .emoji{
    position:relative;

    svg{
      font-size:1.5rem;
      color:#ffff00c8;
      cursor:pointer;
    }
    .emoji-picker-react{
      position:absolute;
      top:-350px;
      background-color:#080420;
      box-shadow:0px 5px 10px #9a86f3;
      border-color:#9186f3;
      max-height:320px;
    

    }

    .emoji-categories{
      button{
        filter:contrast(0);
      }
    }

    .emoji-search{
      background-color:transparent;
      border-color:#9186f3;
    }

    .emoji-group:before{
      background-color:#080420;

    }

  }
}

.input-container{
  width:100%;
 border-radius:2rem;
 
  display:flex;
  align-items:center;
  gap:2rem;
  background-color:#ffffff34;
  input{
    width:100%;
    
    background-color:transparent;
    color:white;
    border:none;
    padding-left:1rem;
    font-size:1.2rem;

    &::selection{
      background-color:#9186f3;
    }

    &:focus{
      outline:none;
    }

  }

  button{
    padding:0.3rem 2rem;
    border-radius:2rem;
    display:flex;
    justify-content:center;
    aling-items:center;
    background-color:#9186f3;
    border:none;

    @media screen and(min-width:720px) and(max-width:1080px){
      padding:.3rem 1rem;
      svg{
        font-size:1rem;
      }
    }

    svg{
      font-size:2rem;
      color:white;
    }
  }
}

`