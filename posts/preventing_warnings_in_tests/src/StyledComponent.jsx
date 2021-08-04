import React from "react"; 
import styled from "styled-components"; 

 export const MyOuterComponent = () => {


    const StyledInnerComponent = styled.div`
        color: red; 
    `; 

    return <div> 
            <StyledInnerComponent>hello world!</StyledInnerComponent>
    </div>
 }

