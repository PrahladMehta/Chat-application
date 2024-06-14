import React,{useState} from 'react'
import styled from "styled-components";
import {NavLink,useNavigate} from "react-router-dom"
import logo from "../assets/logo.svg";
import { registerRouter } from '../utils/Apiroutes';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Register = () => {
  
 const nav=useNavigate();

  const [values,setValues]=new useState({
    username:"",
    email:"",
    password:"",
    confirmPassword:""
  })

 const  toastOp={
    theme:"dark",
    dragable:true
  }

 async function handleSubmit(event){
    event.preventDefault();
   
    if( validation()){

      const response=await axios.post(registerRouter,values);

      const {data}=response;

      if(data.status===false){
        toast.error(data.message,toastOp);
      }
      
      console.log(data);

      if(data.status){
        localStorage.setItem("chat-app-user",JSON.stringify(data.user));
        nav("/");
      }
    }



  }

  function validation(){

    const {username,email,password,confirmPassword}=values;

    if(password!==confirmPassword){
   
      toast.error("Confirm password and password not match",toastOp);
      return false;
    }else if(username.length<4){
      toast.error("User length is smaller then 4",toastOp)
   
      return false;
    }else if(password.length<8){
      
        toast.error("passwrod length is smaller then 8",toastOp);
        return false;
        }else if(email!==""&&email.length<9){
        toast.error("Email is Invalid",toastOp);
          return false;
        }

        return true;
  }

  function changeHandler(event){

        setValues((prev)=>({...prev,[event.target.name]:event.target.value}))
       

  }
  return (
    <>
      <FormContainer>

      <form onSubmit={handleSubmit}>

      <div className="brand">
      <img src={logo} alt="logo" />
      <h1>Snappy</h1>
      </div>

      <input type="text" placeholder='Username' name="username" required onChange={changeHandler} />
      <input type="email" placeholder='Email' name='email' required onChange={changeHandler}/>
      <input type="password" placeholder='Password' name='password' required onChange={changeHandler}/>
      <input type="password" placeholder='Confirm Password' name='confirmPassword' required onChange={changeHandler} />

      <button type='submit'>Create User</button>
      <span>Alredy have an account ? 
      
      <NavLink to="/login">login</NavLink></span>
    
      </form>

      </FormContainer>
      <ToastContainer></ToastContainer>
    </>
  )
}

const FormContainer=styled.div `

    height:100vh;
    width:100vw;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:1rem;
    background-color:#131324;
    .brand{
      display:flex;
      align-items:center;
      gap:1rem;
      justify-content:ceter;
    
    img{
      height:5rem;
    }

    h1{
      color:white;
      text-transform:uppercase;
    }
    }

    form{
      display:flex;
      flex-direction:column;
      gap:2rem;
      background-color:#00000076;
      border-radius:2rem;
      padding:2rem 5rem;
      border:1px solid white;
      ${'' /* color:white; */}
      input{
        padding:1rem;
        background-color:transparent;
        border:0.1rem solid #4e0eff;
        border-radius:0.4rem;
        color:white;
        width:100%;
        font-size:1rem;
        &:focus{

          border:.1rem solid #997af0;
          outline:none;
        }
      }
      button{
   
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
      span{
        color:white;
        text-transform:uppercase;
        a{
        text-decoration:none;
     
        color:#4e0eff;
      }
      }

     
    }

`;

export default Register