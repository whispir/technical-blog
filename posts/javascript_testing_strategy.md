The following are some thoughts regarding testing all things JavaScript (frontend and backend). 


# Summary of test types

## Frontend Specific

ie. involves the DOM, browser APIs etc. 

### Unit tests 

Use RTL. 

Individual tests should run quickly. It's ok if the entire suite takes a while, but of course, faster is better. 

These are the tests that devs should run most often. 

### Real Browser Tests 

eg. Cypress 

It's ok if these take longer. 

Devs should be able to run these on their local machine. 
 
However they don't need to routinely. 

If you can make something a unit test instead, then do. 

Cypress requires a deployed application to run against. This means that often your frontend will also  require some kind of real backend to be talking to (see integrated tests). 

## Backend Specific

ie. involves running a node process

Testing your backend can pose challenges, depending on what your backend looks like, generally there are 2.5 options: 

- Traditional monolith - eg. `node server.js`
- Dockerised backend (ultimately it's still `node server.js` though, however the networking of multiple docker images might pose challenges)
- Serverless (eg. Lambda functions) 

### 'Run the server and then test' - Contract testing 

As far as I know, the only way to be making real HTTP calls against a server is to 'really runnning the server' in some sense. 

This is easier for a traditional monolith because it's easy for the developer to simply run `node server.js`

However, testing lambdas can be more difficult, because the lambda requires an AWS runtime. 

#### Options for running lambda's locally: 

- SAM CLI 
- Roll your own 
- Deploy to real infra via terraform

### Super Test 

https://www.npmjs.com/package/supertest

I've had good experiences with this tool. 

Here's an example of what the code might look like: 

```javascript
const request = require('supertest');
const assert = require('assert');
const express = require('express');

const app = express();

app.get('/user', function(req, res) {
  res.status(200).json({ name: 'john' });
});

request(app)
  .get('/user')
  .expect('Content-Type', /json/)
  .expect('Content-Length', '15')
  .expect(200)
  .end(function(err, res) {
    if (err) throw err;
  });
```

The way I like to write these tests, is to tell a story: 


```
// POST /user  {email: "foo@bar.com"}  - create a user
// Expect 201 response 
// Expect a user with user id objct to be returned 

// GET /user/theUserId 
// Expect 200 response
// Expect the user to be returned

// POST /user  {email: "foo@bar.com"}  - create a user with existing email
// Expect 400 response 
// (It's actually complicated what return code is appropriate here https://stackoverflow.com/questions/3825990/http-response-code-for-post-when-resource-already-exists)
// Expect {errorMessage: "A user with that email address already exists"}

// DELETE /user/theUserId
// Expect 200 response

// GET /user/theUserId
// Expect 404 Response 

```


### Run a subset of the server functionality 

For example say you have an app 

```javascript
const app = express(); 

app.get("/foo", (req, res) => {
    // Something
}); 

app.listen(8000, () => {

}); 

```

Instead of testing the entire express layer, we test just the handler: 

```javascript
const app = express(); 


export const getFooHandler = (req, res) => {
    
    const userId = req.params.userId; 
    someService.getUser(userId); 
}

app.get("/foo", getFooHandler); 

app.listen(8000, () => {

}); 


```

Now we write tests against that `getFooHandler` function. 

**I don't like this approach**. It requires us to basically reimplement express in our tests. 



However, writing tests against `someService.getUser` may be warranted, especially if there is complicated business logic in there. 


## General JavaScript tests 

Plain ol' javascript functions, whether they are running in the Frontend or Backend. 

## Integrated tests

Tests where you might have some form of deployed frontend, making requests against some form of real backend. 

- Often these will be your cypress tests. 
- This also includes if you have a microservices architecture of multiple backends, checking that they're all working with each other. 

# Developer Deployment Strategies

So given that some of the testing strategies above require some kind of integration, it pays to talk about 'how do we run the code, in a developement or testing environment?' 

## Frontend

If using React, I recommend keeping plain unejected Create React App, which comes with the Webpack dev server. 

If proxying backend requests is required, you can use [the proxy configuration](https://create-react-app.dev/docs/proxying-api-requests-in-development). 

## Backend 

### Start a node process

This works for any non-serverless application, eg. a plain ExpressJS API. 

A microservices architecture that needs to talk to each could also be run this way, where you start multiple processes. However this might start getting complicated. 

The process is: 

- For each microservice (or for your one service), run `yarn start`

### Docker Compose/Kubernetes

If using docker, and you have a microservices architecture Docker Compose/Kubernetes can be an effective way to run all of your microservices. 

The process is: 

- For each microservice, build the docker image
- Run `docker-compose up`

### Terraform - Deploy to real infrastructure
















# Frontend Unit Tests

Use (React) [Testing Library](https://testing-library.com/). I use React so I'll talk in terms of React Testing Library (RTL), but note that there are implmentations for Angular, Vue as well. 

## Why I don't like Enzyme

I won't get into it here, it's said well in the [React Testing Library FAQ](https://testing-library.com/docs/react-testing-library/faq): 

>**What about enzyme is "bloated with complexity and features" and "encourage poor testing practices"?**
>
>Most of the damaging features have to do with encouraging testing implementation details. Primarily, these are shallow rendering, APIs which allow selecting rendered elements by component constructors, and APIs which allow you to get and interact with component instances (and their state/properties) (most of enzyme's wrapper APIs allow this).
>
>The guiding principle for this library is:
>The more your tests resemble the way your software is used, the more confidence they can give you. 
>
>Because users can't directly interact with your app's component instances, assert on their internal state or what components they render, or call their internal methods, doing those things in your tests reduce the confidence they're able to give you.
>
>That's not to say that there's never a use case for doing those things, so they should be possible to accomplish, just not the default and natural way to test react components.


## Kinds/layers of frontend tests 

### Environment agnostic javascript tests 

These are tests that don't involve a frontend framework or the DOM at all, but happen to be for some JavaScript code that lives in the frontend.

These tests we will talk about in another section, general javascript testing. Just acknowledging here that difficulty with frontend testing tends to be with the _frontend specific_ nature of them. 

```javascript
function isValidEmailAddress(str) {
    //nb. email regex is actually pretty complicated
    // https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression
    const regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/ 

    return str.match(regex); 
}
```

Where we would write a jest test like 

```javascript
it ("returns true for valid emails", () => {
    expect(isValidEmailAddress("foo@bar.com")).toBe(true); 
    expect(isValidEmailAddress("foo_9999@bar.com")).toBe(true); 
}); 

it ("returns false for invalid emails", () => {
    expect(isValidEmailAddress("foo@bar")).toBe(false); 
    expect(isValidEmailAddress("foo 9999@bar.com")).toBe(false); 
}); 
```

### Unit tests 

These will be your standard RTL tests. 

Use testing library and jest. 

These tests should be run as part of your development workflow, as well as in your build pipeline, and prevent code from being merged if these tests are failing. 

While the whole suite may take a while to run, the individual tests should run fairly quickly. With jest's watch mode - affected tests will be rerun meaning it's quite easy to have tests running as you code. 

**Philosophy of RTL** 

I'll leave it to the [RTL documentation to say it](https://testing-library.com/docs/guiding-principles):

>1. If it relates to rendering components, then it should deal with DOM nodes rather than component instances, and it should not encourage dealing with component instances.
>
>2. It should be generally useful for testing the application components in the way the user would use it. We are making some trade-offs here because we're using a computer and often a simulated browser environment, but in general, utilities should encourage tests that use the components the way they're intended to be used.

That is, we should write the tests in a way that resemble how a real user interact with the thing under test. 

For example, let's say we have a `UserProfile` component that's like: 

```jsx
<table>
    <tr>
        <td>
            Name:
        </td>
        <td>
            <span>{user.name}</span>
        </td>
    </tr>
    <tr>
        <td>
            Contact Email:
        </td>
        <td>
            <span>{user.email}</span>
        </td>
    </tr>
</table>
<button>Edit</button>
```

And when the user presses the Edit button, those spans will turn into inputs and and edit button will change to save changes.  You can see my implementation of this in [UserProfile.jsx](./javascript_testing/src/components/UserProfile.jsx)

We would write a test like: 

```javascript
it("When the user presses the edit button, they can edit their profile", () => {

    // Render the   `UserProfile` component with a user object {name: "Bob", email: "bob@foo.com"}

    // Expect `Name: Bob` to be on the screen
    // Expect `Contact Email: bob@foo.com` to be on the screen

    // Find the button named 'Edit'. 
    // Click it

    // Expect there to be a text input with the label `Name: on the screen
    // Expect it to have the text `Bob`

    // Expect the button's text now says 'Save changes' 

    // Change the text of the input to `Robert`
    // Click the button 

    // Expect the text input to no longer exist
    // Expect `Name: Robert` to be on the screen 
})

```

Here, I've just written pseudocode - but ideally your RTL tests will look a lot like this. 

The important part is - it doesn't matter _how_ the component put the text inputs there, it's _that_ the component put the text inputs there. 


**Testing the component contract**

With that said, I find RTL very useful for testing component contracts. 

By this I mean I will make assertions on the props passed into the component. 

For example, take the `UserProfile` component, let's say its props look like: 


```jsx
render(<UserProfile user = {user} onEditUser = {(user) => {
    console.log("Do something with the new user details"); 
}}/>)
```

Then I _am_ going to use RTL/Jest to check that that `onEditUser` call back is firing properly: 


```jsx

it("Fires the onEditUser callback when the user presses 'Save changes'", () => {

    const fakeOnEditUser = jest.fn(); 
    const user = {
        name: "Bob", 
        email: "bob@foo.com",
    }; 
    render(<UserProfile user ={user} onEditUser = {fakeOnEditUser}/>); 

    // Do the things

    expect(fakeOnEditUser).toHaveBeenCalledWith({
        name: "Robert", 
        email: "bob@foo.com"
    }); 
}); 
```

That is, when I'm writing a unit test for a React component, I'm testing three things: 

1. That for the props I've given the component, it renders them (eg. the name 'Bob' is shown)
2. DOM interactions with the component behave as I expect (I can click the button)
3. Any output (via callbacks) is correct (the callback is fired with the correct value). 

### Cypress / Smoke / Real Browser tests. 

If you're already familiar with tools like Cypress - then you may have noticed that the RTL style of writing tests looks very similar to how we would be write Cypress tests - we find elements in the document and interact with them, and then make assertions about the content of the page. 

(And in fact, note that [Cypress Testing Library](https://testing-library.com/docs/cypress-testing-library/intro/) is a thing - it's basically Cypress with Testing Library style selectors). 

So why would we use Cypress tests at all? 

The short answer is - if you can write a test as an RTL test rather than a Cypress test, then you probably should. 

Key differences between RTL and Cypress

- Cypress runs in a real browser, RTL runs in a virtual browser (JSdom) 
- Cypress requires a fully deployed application (even if deployed locally), RTL can render just sub trees of your application. 
- Cypress has a visual playback of the tests, and pausible interaction with a real browser - RTL does not. 
- Your deployed application will need to have a backend for any API calls etc. 

In my opinion, where Cypress is useful is: 
- To test browser-specific issues. 
- As a smoke test against a deployed application. 

And that's about it - in my opinion Cypress should be used sparingly - RTL should suffice for your comprehensive test cases. 


**Visual Testing**

Another area where real browser tests can be used is in doing visual tests - using tools like [Percy](https://docs.percy.io/docs/getting-started). 

I have not used any of these tools - and these are likely more useful for a more mature organisation and codebase. 


## API testing

There 


## 






