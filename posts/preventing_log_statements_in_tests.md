# Disallowing warning/error messages in tests. 

Often when running Jest tests, errors or warnings will be thrown up, but the tests will be passing fine. 


For example, lets say you have a React component like this: 

```javascript

export const MyComponent = () => {
    const values = ["a", "b", "c"]; 

    return <div> 
        {values.map((v) => <span>{v}</span>)}
    </div>; 
}
```

And we write a test like: 


```javascript
describe("MyComponent", () => {
    it ("Renders fine", () => {
        render(<MyComponent/>)


        expect(screen.getByText("a")).toBeInTheDocument();
        expect(screen.getByText("b")).toBeInTheDocument();
        expect(screen.getByText("c")).toBeInTheDocument();
    })
});
```


This test will pass fine, but we get a warning about not having a unique key prop: 

```
 PASS  src/MyComponent.test.jsx
  MyComponent
    ✓ Renders fine (68 ms)

  console.error
    Warning: Each child in a list should have a unique "key" prop.

    Check the render method of `MyComponent`. See https://reactjs.org/link/warning-keys for more information.
        at span
        at MyComponent

      3 |     const values = ["a", "b", "c"];
      4 |
    > 5 |     return <div>
        |            ^
      6 |         {values.map((v) => <span>{v}</span>)}
      7 |     </div>;
      8 | }

      at printWarning (node_modules/react/cjs/react-jsx-dev-runtime.development.js:117:30)
      at error (node_modules/react/cjs/react-jsx-dev-runtime.development.js:93:5)
      at validateExplicitKey (node_modules/react/cjs/react-jsx-dev-runtime.development.js:986:5)
      at validateChildKeys (node_modules/react/cjs/react-jsx-dev-runtime.development.js:1013:11)
      at jsxWithValidation (node_modules/react/cjs/react-jsx-dev-runtime.development.js:1184:11)
      at MyComponent (src/MyComponent.jsx:5:12)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:14985:18)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        2.238 s
```


This is a problem for a couple of reasons: 

- Firstly, we really should fix that warning message. 
- Secondly, having those warning messages around makes it hard to read the output of our tests


## Solution - Make Jest fail on any console warnings/errors

The basic strategy is that we mutate the `console` object so that the `console.warn` and `console.error` functions throw an error instead of printing. 

We can do this in the [`setupTests.js`](https://create-react-app.dev/docs/running-tests/#initializing-test-environment) file, if you are using Create React App. 

The simplest solution looks like this: 

```javascript
//setupTests.js

import '@testing-library/jest-dom';

const {warn, error} = console; 

console.warn = (...args) => {
    warn(...args); 
    
    throw new Error("Encountered a console.warn message! Please fix this!");
}


console.error = (...args) => {
    error(...args); 
    
    throw new Error("Encountered a console.error message! Please fix this!");
}

```


Now our test no longer passes, we get: 


```
 FAIL  src/MyComponent.test.jsx
  MyComponent
    ✕ Renders fine (70 ms)

  ● MyComponent › Renders fine

    Encountered a console.error message! Please fix this!

      21 | console.error = (...args) => {
      22 |     error(...args);
    > 23 |     throw new Error("Encountered a console.error message! Please fix this!");
         |           ^
      24 | }
```


### First caveat - this technique will not work if the console message occurs inside a try block 

Unfortunately, this technique will not work if there is ever a scenario where the console.warn/console.error occurs inside of a try block. And error is thrown but then is caught and the code continues executing. 

And example of this occurs if you are using styled-components. For example: 

Code: 

```javascript
 export const MyOuterComponent = () => {
    const StyledInnerComponent = styled.div`
        color: red; 
    `; 

    return <div> 
            <StyledInnerComponent>hello world!</StyledInnerComponent>
    </div>
 }

```

Test: 

```javascript
describe("StyledComponent", () => {
    it ("Renders fine", () => {
        render(<MyOuterComponent/>);

        expect(screen.getByText("hello world!")).toBeInTheDocument();

    })
});     
```

Output: 

```
 PASS  src/StyledComponent.test.jsx
  ● Console

    console.warn
      The component styled.div with the id of "sc-bdnxRM" has been created dynamically.
      You may see this warning because you've called styled inside another component.
      To resolve this only create new StyledComponents outside of any render method and function component.

      14 |
      15 | console.warn = (...args) => {
    > 16 |     warn(...args);
         |     ^
      17 |     throw new Error("Encountered a console.warn message! Please fix this!");
      18 | }
      19 |
```


We get a warning message here, but the test still passes. 

We can track down the reason for this behaviour to styled-components [here](https://github.com/styled-components/styled-components/blob/001957c2dfae92a289ab7b47b82875fba05e281f/packages/styled-components/src/utils/checkDynamicCreation.ts) where we can see that the console.warn occurs within a try block. 

I'll talk about possible solutions in a later section. 

## Making this more usable 

There's a couple of extra things I like to add to make this more usable: 

### Make the failure 'opt-in'

It might be a pain to have your tests failing when you're developing them. It might be better to have the tests passing, and just see the warning/error messages. 

We introduce an environment variable `TEST_MODE`, which will only throw the error if the mode is `strict`. 

On our CI server we run the tests in strict mode. 

### Allow whitelisting of certain errors/warnings 

There may be some warning messages that we are OK either living with, or ignoring outright. 

To do this, I maintain a list of 'ignore' messages and 'whitelist' messages. 

### Putting it all together

(Note this is typescript)

```typescript
const {warn, error} = console; 

// Maintain allowed/ignored messages here
const warnIgnoreList = []; 
const warnAllowList = []; 

const errorIgnoreList = []; 
const errorAllowList = []; 


console.warn = (message: string | Error, ...rest) => {
  const str = typeof message === 'string' ? message : message.message;

  for (let ignoreString of warnIgnoreList) {
    if (str.includes(ignoreString)) {
      return; // exit early
    }
  }

  warn(message, ...rest);

  for (let allowString of warnAllowList) {
    if (str.includes(allowString)) {
      return; // exit early
    }
  }

  if (process.env.TEST_MODE === 'strict') {
    const errorMessage = `Encountered a non-allowed console warning: ${str}  Please fix this!`;
    error(errorMessage);
    throw new Error(errorMessage);
  }
};

console.error = (message: string | Error, ...rest) => {
  const str = typeof message === 'string' ? message : message.message;

  for (let ignoreString of errorIgnoreList) {
    if (str.includes(ignoreString)) {
      return; // exit early
    }
  }

  error(message, ...rest);

  for (let allowString of errorAllowList) {
    if (str.includes(allowString)) {
      return; // exit early
    }
  }

  if (process.env.TEST_MODE === 'strict') {
    const errorMessage = `Encountered a non-allowed console error: ${str}  Please fix this!`;
    error(errorMessage);
    throw new Error(errorMessage);
  }
};
```

## Back to that error swallowing problem 

Some potential solutions: 

### Instead of throwing and error, use process.exit(1)

I played around with this, but it doesn't work nicely. It does exit with an error code, meaning that your CI server won't allow it to continue, but Jest gets all messed up (it seems like Jest spawns multiple processes) and your messages are hard to read. More trouble than it's worth.

### It would be nice if there was a 'jest.fail()` kind of method

But I'm not aware of one. 

### A manual register of warnings and fail the test at the end 

I mean, this seems to work fine: 

```javascript
//testUtils.js


import { v4 as uuid } from 'uuid';


const testRegisters = {}; 

export function registerTest() {
    const id = uuid();

    testRegisters[id] = []; 
    process.env.TEST_ID = id; 

}


export function registerWarning(message) {
    const id = process.env.TEST_ID;

    if (id && testRegisters[id]){
        testRegisters[id].push(message); 
    }
}

export function cleanUpTest() {

    const id = process.env.TEST_ID;
    if (testRegisters[id].length > 0) {
        throw new Error("Disallowed console warnings/errors exist on this test!");
    }
}
```

```javascript
//setupTests.js

console.warn = (...args) => {
    registerWarning(...args); 
    warn(...args); 
    throw new Error("Encountered a console.warn message! Please fix this!");
}
```

```javascript
//tests
beforeEach(() => {
    registerTest();
}); 


afterEach(() => {
    cleanUpTest();
}); 


describe("StyledComponent", () => {
    it ("Renders fine", () => {
        render(<MyOuterComponent/>)


        expect(screen.getByText("hello world!")).toBeInTheDocument();

    })
});     

describe("SomethingElse", () => {
    it ("Renders fine", () => {
        render(<div> hello world!</div>)


        expect(screen.getByText("hello world!")).toBeInTheDocument();

    })
});     

```


Output: 
```
 FAIL  src/StyledComponent.test.jsx
  StyledComponent
    ✕ Renders fine (33 ms)
  SomethingElse
    ✓ Renders fine (4 ms)

  ● StyledComponent › Renders fine

    Disallowed console warnings/errors exist on this test!

      25 |     const id = process.env.TEST_ID;
      26 |     if (testRegisters[id].length > 0) {
    > 27 |         throw new Error("Disallowed console warnings/errors exist on this test!");
         |               ^
      28 |     }
      29 | }

      at cleanUpTest (src/testUtils.js:27:15)

```


Anyone want to criticise why this shouldn't be done? 
