import './App.css';
import { useState } from 'react';
import { UserProfile } from './components/UserProfile';
import { TodoList } from './components/TodoList';


import {TodoList as TodoList3} from "./components/TodoList3/TodoList";

function App() {

  const [user, setUser] = useState({
    name: "Bob", 
    email: "bob@foo.com"
  }); 

  

  return <div>
    {/* <TodoList/>
    <UserProfile user = {user} onSaveUser = {setUser}/> */}


    <TodoList3/>
    


  </div>
}

export default App;
