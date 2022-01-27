import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import { UserProfile } from './components/UserProfile';

function App() {

  const [user, setUser] = useState({
    name: "Bob", 
    email: "bob@foo.com"
  }); 

  return <UserProfile user = {user} onSaveUser = {setUser}/>
  
}

export default App;
