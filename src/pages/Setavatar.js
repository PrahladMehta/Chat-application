import React from 'react'
import { useState,useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import loader from "../assets/loader.gif"
import { ToastContainer,toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { setAvatarRoute } from '../utils/Apiroutes';
import styled  from "styled-components";
import { Buffer } from 'buffer'
const SetAvatar = () => {
  const api="https://api.multiavatar.com/45678945";
 const nav=useNavigate();

 const [avatars,setAvatars]=useState([]);
 const[isLoading,setIsLoading]=useState(true);
 const[selectedAvatar,setSelectedAvatar]=useState();
const toastOptions={
  theme:"dark",
  draggable:true,
};

const setProfilePicture=async()=>{

  if(selectedAvatar===undefined){
    toast.error("Please select an avatar",toastOptions);
  }else{
    const user=await JSON.parse(localStorage.getItem("chat-app-user"));

    const {data}=await axios.post(`${setAvatarRoute}/${user._id}`,{
      image:avatars[selectedAvatar]
    });
  

  if(data.isSet){
    user.isAvatarImageSet=true;
    user.avatarImage=data.image;
    localStorage.setItem("chat-app-user",JSON.stringify(user));
    nav("/");
  }else{
    toast.error("Error Setting avatar. Please try again",toastOptions);
  }
}

}

async function fetchData(){
  try{ 
    setIsLoading(true);
     const data=[];
    for(let i=0;i<4;i++){
       const image=await axios.get(`${api}/${Math.round(Math.random()*1000)}`);
       const buffer=new Buffer(image.data);
       data.push(buffer.toString("base64"));
    }
    setAvatars(data);
    setIsLoading(false);
  }catch(e){
    console.log(e);
   
  }
}


useEffect(()=>{

  if(!localStorage.getItem("chat-app-user")){
      nav("/login");
  }else{
    fetchData();
  }
},[]);

  return (
   <>
   {
    isLoading?<Container>
      <img src={loader} alt="loader" width="300" />
    </Container>
   :
    <Container>
      <div className="title-container">
        <h1>Pick an avatar as your profile picture</h1>

      </div>
      <div className="avatars">
        {
          avatars.map((avatar,idx)=>{
            return <div key={idx} className={`avatar ${selectedAvatar===idx?"selected":""}`} onClick={()=>setSelectedAvatar(idx)}>

                <img src={`data:image/svg+xml;base64,${avatar}`} alt="avatar"  width="100"/>
            </div>
          })
        }
      </div>
      <button className='submit-btn' onClick={setProfilePicture}>Set Profile Picture</button>
    </Container>
    }
    <ToastContainer></ToastContainer>
   </>
  )
}


const Container=styled.div`
display:flex;
justify-content:center;
align-items:center;
flex-direction:column;
gap:3rem;
background-color:#131324;
height:100vh;
widht:100vw;
.loader{
  max-inline-size:100%;
}

.title-container{
  h1{
    color:white;
  }
}
.avatars{
  display:flex;
  gap:2rem;
  .avatar{
    border:0.4rem solid transparent;
    padding:0.4rem;
    border-radius:5rem;
    display:flex;
    justify-content:center;
    align-items:center;
    transition:0.5s ease-in-out;
    img{
      height:6rem;
    }

  
  }
  .selected{
      border:0.4rem solid #4e0eff;
    }
}
.submit-btn{
   
   background-color:#997af0;
   color:white;
   padding:1rem 2rem;
   border:none;
   cursor:pointer;
   border-radius:0.4rem;
   font-size:1rem;
   text-transform:uppercase;
   transition:.5s ease-in;
   &:hover{
     background-color:#4e0eff;
   }

 }
`;


export default SetAvatar