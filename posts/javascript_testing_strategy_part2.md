# Dependency Injection

Dependency injection is a common and well established design pattern in software engineering. You can read the [Wikipedia article here](https://en.wikipedia.org/wiki/Dependency_injection#:~:text=In%20software%20engineering%2C%20dependency%20injection,it%20depends%20on%2C%20called%20dependencies.&text=The%20'injection'%20refers%20to%20the,part%20of%20the%20client's%20state.).

Dependency injection involves _injecting_ a function or service into the thing that uses it, rather than the thing that uses making static reference to the service and calling it directly. 

## Frontend Example

### Naive Example

Take this simple React component: 

```jsx
//TodoList0/TodoList.jsx
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
        {isLoading && "Loading..."}

        {todos.map((v) => {
            return <div key={v.id}>
                {v.title}
            </div>
        })}
    </>;
};
```

This works fine, and we can even write a working test for it: 

```jsx
//TodoList0/TodoList.test.jsx
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import React from 'react';
import { TodoList } from './TodoList';

describe('<TodoList/>', () => {
    it("Shows the todo after loading has completed", async () => {
        // Render the component
        render(<TodoList />);

        // Assert that the loading text is there 
        const loadingText = screen.getByText("Loading...");
        expect(loadingText).toBeInTheDocument();

        // Wait for the loading text to disappear
        await waitForElementToBeRemoved(loadingText);

        // Check for the existence of one of our todos
        const todoText = screen.getByText("delectus aut autem");
        expect(todoText).toBeInTheDocument();
    });
});
```

But there's a couple of major problems with this test: 

1. We're making a _real API call_ when we run the test. The jsonplaceholder API is pretty fast, so it's not really a problem for us, but you can imagine this really slowing down your unit tests if there were multiple API calls and a slower API. 
2. The behaviour of the API is non-deterministic. 

    In our test we are checking that the todo with the title "delectus aut autem" exists. But tomorrow that todo could have been deleted off the server, and now our test would fail! 
    
    We'd then need to spend effort working out why our test is failing, only to find it's not our fault!

    Similarly, the API could be down for maintainence when we run our test. Again the test would fail, and we'd have to spend effort working out why. 

### Not really a solution - extract the API URL to an environment variable 

We could change 

```js
const res = await fetch('https://jsonplaceholder.typicode.com/todos');
```

to 

```js
const res = await fetch(process.env.REACT_APP_API_URL);
```

Now, we could start our tests with: 

```
REACT_APP_API_URL=http://localhost:3000/todos
```

And so long as we have a server running on `localhost:3000` that is going to serve up the results we want (in an arguably more deterministic manner) then this will work. 

But this is _way_ too much work. I don't want to write an entire server, just to write my tests. 

### Dependency Injection Approach 1a - Manual Module Mocking 

In this approach we make some small changes: 

We pull the logic of fetching the todos out into its own function in a seperate module 

```js
//TodoList1a/todoListService.js
export async function fetchTodos () {
    const res = await fetch('https://jsonplaceholder.typicode.com/todos');
    const json = await res.json();

    return json; 
}
```

And we import this function and all it inside the TodoList, as we did before: 

```js
// TodoList1a/TodoList.jsx
import React, { useEffect, useState } from 'react';
import { fetchTodos } from './todoListService2';
export const TodoList2 = () => {
//... 

    // When the component mounts, we fetch the todos from the server
    useEffect(async () => {
        const json = await fetchTodos();
        setTodos(json);
        setIsLoading(false); 
    }, []);
//...
```

Now, we can _mock_ the behaviour of that function using [jest's module mocking functionality](https://jestjs.io/docs/jest-object#jestmockmodulename-factory-options)

```jsx
//TodoList1a/TodoList.test.jsx
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import React from 'react';
import {TodoList} from "./TodoList"; 

// Mock the module
jest.mock('./todoListService');

// Import it, so we have access to it. 
import {fetchTodos} from "./todoListService";

describe('Example 1b - <TodoList/>', () => {
    it("Shows the todo after loading has completed", async () => {
 
        fetchTodos.mockResolvedValue([
            {
                "userId": 1,
                "id": 1,
                "title": "foo", 
                "completed": false
              },
        ]);

        // Render the component
        render(<TodoList />);

        // Assert that the loading text is there 
        const loadingText = screen.getByText("Loading...");
        expect(loadingText).toBeInTheDocument();

        // Wait for the loading text to disappear
        await waitForElementToBeRemoved(loadingText);

        // Check for the existence of one of our todos
        const todoText = screen.getByText("foo");
        expect(todoText).toBeInTheDocument();

    });
});
```

Now this works, and is a lot easier to deal with: 

- It's deterministic
- We can now mock other behaviours. For example, what happens if `fetchTodos` throws an error, because the database is down, instead? How do we want our component to handle that situation?

However, there's a couple of things about this I don't like: 

- I generally don't like module mocking. It's too magic. 
- What if we have another component `MyApplication` that contains `TodoList` as a child? 

```jsx

export const MyApplication = () => {
    return <div>
        <h1>Hello world!</h1>
        <TodoList/>
    </div>;
}
```

And lets say we don't care about the behaviour of `TodoList` in this component, we're just going to check that the text `Hello World!` is on the screen. 

Now when we go to test this, unless we're mocking that module again, we're going to have some of the same problems as the first approach - we're now making real API calls when we run the test. 

However, this objection is specific to way the I've done the module mocking here. 

If we instead use the jest `__mocks__` pattern, we can set a series of permenent mocks will be present in all tests. 

### Dependency Injection Approach 1b - Module Mocks

☝️ I've only just discovered/cottoned-on to the potential use of this pattern, and I'm not particularly familiar with it. 


In this example we follow the guide in the [Manual Mocks section of the jest documentation](https://jestjs.io/docs/manual-mocks).

First we create a `__mocks__` folder in beside the module we want to mock, and we create a new module there. 

```js
//TodoList1b/__mocks__/todoListService.js
export const  fetchTodos = async () => [           {
    "userId": 1,
    "id": 1,
    "title": "foo",
    "completed": false
  }];

```

Now in our test we can do away with any of the mocking. Instead of the real function being called, this function will be called instead. 

```jsx
//TodoList1b/TodoList.test.jsx
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import React from 'react';
import {TodoList} from "./TodoList"; 

// We still need to state that we are mocking the service
// But the implementation is defined by what is in the mocks folder
jest.mock('./todoListService');

describe('Example 1b - <TodoList/>', () => {
    it("Shows the todo after loading has completed", async () => {
 
        // Render the component
        render(<TodoList />);

        // Assert that the loading text is there 
        const loadingText = screen.getByText("Loading...");
        expect(loadingText).toBeInTheDocument();

        // Wait for the loading text to disappear
        await waitForElementToBeRemoved(loadingText);

        // Check for the existence of one of our todos
        const todoText = screen.getByText("foo");
        expect(todoText).toBeInTheDocument();

    });
});


```

🚨 Here's what I don't like about this approach. 

It now seems impossible to mock that module (and for example, change the behaviour of it). 

For example: 

```jsx
///TodoList1b/TodoList_MockOverrideAttempt.test.jsx
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import React from 'react';
import {TodoList} from "./TodoList"; 

// Mock the module
jest.mock('./todoListService');

// Import it, so we have access to it. 
import {fetchTodos} from "./todoListService";

describe('Example 1b - <TodoList/>', () => {
    it.skip("Shows the todo after loading has completed", async () => {
 
        fetchTodos.mockResolvedValue([
            {
                "userId": 1,
                "id": 1,
                "title": "bar", // Changing the title to bar
                "completed": false
              },
        ]);

        // Render the component
        render(<TodoList />);

        // Assert that the loading text is there 
        const loadingText = screen.getByText("Loading...");
        expect(loadingText).toBeInTheDocument();

        // Wait for the loading text to disappear
        await waitForElementToBeRemoved(loadingText);

        // Check for the existence of one of our todos
        const todoText = screen.getByText("bar");
        expect(todoText).toBeInTheDocument();

    });
});


```

This fails with: 

```
  ● Example 1b - <TodoList/> › Shows the todo after loading has completed

    TypeError: _todoListService.fetchTodos.mockResolvedValue is not a function

       9 |     it("Shows the todo after loading has completed", async () => {
      10 |
    > 11 |         fetchTodos.mockResolvedValue([
```


I also can't make assertions on the function, like: 

```js
expect(fetchTodos).toHaveBeenCalled();
```

I tried changing the implmentation of the mock module to: 

```js

export const  fetchTodos = jest.fn().mockResolvedValue([
      {
    "userId": 1,
    "id": 1,
    "title": "foo",
    "completed": false
  }
])

```

But this doesn't work - the function will come through as a jest mock function, but it will not return anything. I believe this is because the mock function  is being reset and the 'mockResolvedValue' being cleared, before the test runs. [See the section at the end of the page about this.](#note-about-mock-resets) 

I believe this GitHub issue may describe it: 

https://github.com/facebook/jest/issues/10419

Also: 

https://github.com/facebook/jest/issues/5969


All this to say that I think I'm feeling vindicated in my opposition to module mocking. 

### Dependency Injection 2 - Dependency as a prop

In this example, instead of importing `fetchTodos` from a module, we instead recieve it as a prop: 

```jsx
//TodoList2/TodoList.jsx
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


    //...

```

Now in our test, we just need to provide the function as a prop: 

```jsx

//TodoList2/TodoList.test.jsx

        //...
        const fakeFetchTodos = jest.fn().mockResolvedValue([
            {
                "userId": 1,
                "id": 1,
                "title": "foo", 
                "completed": false
              },
        ])
        // Render the component
        render(<TodoList fetchTodos = {fakeFetchTodos} />);

        //...
```

So this is nice, it does away with all of the complications of module mocking, while still allowing us to easily mock the behaviour of our `fetchTodos` function. 

This also allows us to later change the implementation of how we fetch the todos (for example, maybe switching over to GraphQL), without having to change anything inside of the TodoList component. All we need to do is provide a different function that has the same signature. 

But there's a slight problem with this solution as is. 

In our application as it currently is, we'll likely provide the real `fetchTodos` function at the top level in the `App` component

```jsx
async function fetchTodos () {
    const res = await fetch('https://jsonplaceholder.typicode.com/todos');
    const json = await res.json();

    return json; 
}

export const App = () => {
    return <div> 
        <TodoList fetchTodos = {fetchTodos}/>
    </div>
}
```


But what say instead we had some intermediate component that the TodoList lives in? 

```jsx
async function fetchTodos () {
    const res = await fetch('https://jsonplaceholder.typicode.com/todos');
    const json = await res.json();

    return json; 
}

export const App = () => {
    return <div> 
        <UserHomePage fetchTodos={fetchTodos}/>
    </div>
}
```

```jsx
export const UserHomePage = (props) => {
    const {fetchTodos} = props; 
    return <div>
            <TodoList fetchTodos = {fetchTodos}/>
    </div>
}
```
Now we're doing a prop drilling pattern, which isn't very nice. 


So you could say 'well why not just import the `fetchTodos` from a module and pass them in at `UserHomePage`?'. Well, then we'd have to be module mocking `UserHomePage` when we go to test it!


### Dependency Injection 3 - Inject Via Context

👍 This is the approach I recommend. 👍

In this example, instead of accessing the `fetchTodos` function via props, we access it via a hook, which gets the function from context. 

We first create some React Context to provide the `fetchTodos` function 

```jsx
//TodoList3/FetchTodosProvider.jsx
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
```

☝️ There is a good argument for not providing default services. See part three. 

We can now access `fetchTodos` via the hook: 

```js
//TodoList3/TodoList.jsx
//...

// Get the fetchTodos function from the hook. 
const fetchTodos = useFetchTodos();
```

Our test can now look like this: 

```jsx
//TodoList3/TodoList.test.jsx
describe('Example 3 - <TodoList/>', () => {
    it("Shows the todo after loading has completed", async () => {
        

        const fakeFetchTodos = jest.fn().mockResolvedValue([
            {
                "userId": 1,
                "id": 1,
                "title": "foo", 
                "completed": false
              },
        ])
                // Render the component

        render(
        <FetchTodosProvider fetchTodos = {fakeFetchTodos}>
            <TodoList />
        </FetchTodosProvider>
        );

        //...
```

Very similar to the 'injecting via props' solution - but now we don't have that problem with prop drilling. 

Using this context pattern has other advantages, namely that you can use the `FetchTodosContext` for manging your todos _state_ as well. This way if you have say three different components that need to now the current state of the todos, they all have access to the same state in the context, rather than each managing their own state. 

As your code base grows, managing all these different services that you need to mock out may become cumbersome. You can solve this by creating a `TestContextProvider` which contains _all_ the various context providers you may be using, and 


### Dependency Injection 4 - Inject Via Higher Order Function/Higher Order Component

I include this example for posterity. 

React hooks in function components are a little bit magic, some of them like `useState` behave differently depending on whether this is the first time you've called a function or a subsequent call. 

This is certainly not functional in the sense of functional programming, which is why I take care to call them _function_ components, and not _function**al**_ components. 

But I digress. All that said, hooks are convenient, and I like them. 

However, if we did want a properly functional way of injecting dependencies just where they are needed, a higher order function will do the trick. 

Essentially, we inject the dependency via a prop as we did in example 2. 

We now create a function that is responsible for passing the service in: 

```jsx
//TodoList4/TodoList.jsx

//...
export const withFetchTodosService = (Component) => () =>  {
    async function fetchTodos () {
        const res = await fetch('https://jsonplaceholder.typicode.com/todos');
        const json = await res.json();
    
        return json; 
    }

    return <Component fetchTodos = {fetchTodos}/>
}

export const ServicedTodoList = withFetchTodosService(TodoList);
```

Now, if we need to write tests for `TodoList` we write tests as we did in example 2. 

But in our application and elsewhere we used the `ServicedTodoList`. 

This solves the issue of prop drilling that we had in issue 2. 

However, it reintroduces the problem of 'if this component happens to get rendered as part of another components test, it'll make real API calls'. 

To get around this, we could add a conditional to our HOF: 

```js
export const withFetchTodosService = (Component) => () =>  {

    cosnt  fetchTodos = process.env.USE_REAL_SERVICES === 'true'? async () =>  {
        const res = await fetch('https://jsonplaceholder.typicode.com/todos');
        const json = await res.json();
    
        return json; 
    } : async () => {
        return [
                {
                "userId": 1,
                "id": 1,
                "title": "foo", 
                "completed": false
              },
        ]
    }

    return <Component fetchTodos = {fetchTodos}/>
}
```

But this is gross. We have no way of changing the behaviour of our test service. We're writing conditionals everywhere. 

We could go down a path of somewhere in application we call call a function that configures what function the `withFetchTodosService` will inject. eg: 

```js
//TodoList4b/TodoList.jsx

let fetchTodos = async () =>  {
    const res = await fetch('https://jsonplaceholder.typicode.com/todos');
    const json = await res.json();

    return json; 
}; 

export const setFetchTodosFn = (fn) => {
    // Note we are doing a module mutatation here. 
    fetchTodos = fn; 
}

export const withFetchTodosService = (Component) => () => {
    return <div>
        <Component fetchTodos = {fetchTodos}/>
    </div>; 
}

export const ServicedTodoList = withFetchTodosService(TodoList);
```

But this is getting hard to reason about, I really don't like that module mutation, and you know, that's basically what we're doing with the context provider, we're saying 'This the state of our services that we want to mount this component in'. 

🧐 This does take us to another interesting discussion though, within a React applicatin we can just use Context, but what about for plain ol' JavaScript programming, how would we inject dependencies without the `useContext` hook? Let's talk about that in a later section. 


### Note about mock resets. 

☝️ I haven't fulled investigated this yet. 

It appears that the default CRA jest configuration likely has reset mocks on, and this means that any mock functions you declare outside the test (eg. in the __mocks__ file, will be reset to no implementation, by the time the test runs). 





