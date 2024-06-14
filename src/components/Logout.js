import React from 'react'
import styled from 'styled-components'
import {BiPowerOff} from "react-icons/bi";
import { useNavigate } from 'react-router-dom';

const Logout = () => {
      const nav=useNavigate();

      function handleClick(){
            localStorage.clear();
            nav("/login")

      }
  return (
   <Button onClick={handleClick}>
      <BiPowerOff></BiPowerOff>
   </Button>
  )
}

export default Logout

const Button=styled.button`
display:flex;
align-items:center;
justify-content:center;
padding:.5rem;
border-radius:.5rem;
background-color:;
border:none;
cursor:pointer;
background-color:#9a86f3;
svg{
      font-size:1.3rem;
      color:#ebe7ff;
}
`