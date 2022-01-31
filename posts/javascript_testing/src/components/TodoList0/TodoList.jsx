import React, { useEffect, useState } from 'react';

export const TodoList = () => {


    const [isLoading, setIsLoading] = useState(true); 
    const [todos, setTodos] = useState([]);


    // When the component mounts, we fetch the todos from the server
    useEffect(async () => {
        // We are fetching data from jsonplaceholder.typicode.com, which is a fantastic public REST API, perfect for these examples
        const res = await fetch('https://jsonplaceholder.typicode.com/todos');
        const json = await res.json();
        setTodos(json);
        setIsLoading(false); 
    }, []);


    // For each todo, display the title
    return <>
        <h1>Todos:</h1>

        {/* Display the 'loading...' text only while doing that initial fetch */}
        {isLoading && <span>Loading...</span>}

        {todos.map((v) => {
            return <div key={v.id}>
                {v.title}
            </div>
        })}
    </>;
};