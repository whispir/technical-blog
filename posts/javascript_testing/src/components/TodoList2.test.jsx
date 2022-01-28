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
