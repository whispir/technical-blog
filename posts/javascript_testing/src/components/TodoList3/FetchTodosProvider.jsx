
import React from "react"; 

// Our default ('real') function
const defaultFetchTodos =  async () => {
    const res = await fetch('https://jsonplaceholder.typicode.com/todos');
    const json = await res.json();
    return json; 
}; 

// Create the context and instantiate defaults
export const FetchTodosContext = React.createContext({
    fetchTodos: defaultFetchTodos
}); 

// Create a provider component 
export const FetchTodosProvider = (props) => {
    const {fetchTodos, children} = props; 
    return <FetchTodosContext.Provider value = {{fetchTodos}}>
        {children}
    </FetchTodosContext.Provider>
}
// Create a hook to access the fetchTodos function 
export const useFetchTodos = () => {

    return React.useContext(FetchTodosContext).fetchTodos; 
}
