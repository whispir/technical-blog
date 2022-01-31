import React, { useEffect, useState } from 'react';

export const TodoList = (props) => {


    const {fetchTodos} = props; 
    const [isLoading, setIsLoading] = useState(true); 
    const [todos, setTodos] = useState([]);


    // When the component mounts, we fetch the todos from the server
    useEffect(async () => {
        const json = await fetchTodos();
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