export async function fetchTodos () {
    const res = await fetch('https://jsonplaceholder.typicode.com/todos');
    const json = await res.json();

    return json; 
}