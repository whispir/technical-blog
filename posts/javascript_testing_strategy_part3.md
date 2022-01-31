

# Random Collection of Points

## Argument for not providing a default service. 

In the example given in TodoList3, our context is instantiated with a 'real' service making real API calls. 

This means that if we mount our TodoList in a test (or any other component) then it will work fine, using that default value.  

What we want to do instead is either change that default service to:

```js
const defaultFetchTodos = () => {
    throw new Error("No fetchTodos service was present!"); 
}
```

Or leave the default value undefined and change our hook to: 

```js
const useFetchTodos = () => {
    const fetchTodos = React.useContext(FetchTodosContext).fetchTodos; 

    if (!fetchTodos) {
        throw new Error("No fetchTodos service was present!"); 
    }

    return fetchTodos;
}
```

What this will do is tell the developer - 'Hey - this component is only going to work within a context, you need to explicitly configure the context provider' - forcing them to think about/implement the service. 


