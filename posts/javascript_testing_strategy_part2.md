# Dependency Injection

Dependency injection is a common and well established design pattern in software engineering. You can read the [Wikipedia article here](https://en.wikipedia.org/wiki/Dependency_injection#:~:text=In%20software%20engineering%2C%20dependency%20injection,it%20depends%20on%2C%20called%20dependencies.&text=The%20'injection'%20refers%20to%20the,part%20of%20the%20client's%20state.).

Dependency injection involves _injecting_ a function or service into the thing that uses it, rather than the thing that uses making static reference to the service and calling it directly. 

## Frontend Example

### Naive Example

Take this simple React component: 

```jsx
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

### Dependency Injection Approach 1 - Module Mocking 

In this approach we make some small changes: 

We pull the logic of fetching the todos out into its own function in a seperate module 

```js
//todoListService2.js
export async function fetchTodos () {
    const res = await fetch('https://jsonplaceholder.typicode.com/todos');
    const json = await res.json();

    return json; 
}
```

And we import this function and all it inside the TodoList, as we did before: 

```js
// TodoList.jsx
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
//TodoList2.test.jsx
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import React from 'react';
import { TodoList2 } from './TodoList2';

// By calling mock on just the module name, jest will _auto_mock_ the functions in it
jest.mock('./todoListService2'); 

// Now the thing that is imported, will be a `jest.fn` mock function. 
import {fetchTodos} from "./todoListService2"; 

describe('<TodoList2/>', () => {
    it("Shows the todo after loading has completed", async () => {

        // Decide what the fetchTodos function should do when called
        fetchTodos.mockResolvedValue([
            {
                "userId": 1,
                "id": 1,
                "title": "foo",
                "completed": false
              },
        ]);

        // Render the component
        render(<TodoList2 />);

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



