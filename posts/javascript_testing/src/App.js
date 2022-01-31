import './App.css';
import { useState } from 'react';


import {TodoList as TodoList3} from "./components/TodoList3/TodoList";
import {ServicedTodoList as ServicedTodoList4 } from "./components/TodoList4/TodoList";

import {UserProfile as UserProfile4b} from "./components/TodoList4b/UserProfile";

function App() {

  const [user, setUser] = useState({
    name: "Bob", 
    email: "bob@foo.com"
  }); 

  

  return <div>

    <TodoList3/>

    <ServicedTodoList4/>
    <UserProfile4b/>
    


  </div>
}

export default App;
