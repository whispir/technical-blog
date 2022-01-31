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
