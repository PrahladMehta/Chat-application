import React from 'react'
import styled from 'styled-components'
import Robot from "../assets/robot.gif";

const Welcome = ({currUser}) => {
  return (
      <Container>
        <img src={Robot} alt="" /> 
        <h1>
          Welcome, <span> {currUser.username}</span>
        </h1>
        <h3> Please select a chat to start</h3>
      </Container>
  )
}

export default Welcome

const Container=styled.div`
    display:flex;
    align-items:center;
    justify-content:center;
    flex-direction:column;
    color:white;

    img{
      height:20rem;

    }

    span {
      color:#4e00ff;
    }
`