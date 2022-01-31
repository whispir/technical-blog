import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import React from 'react';
import {TodoList} from "./TodoList"; 

// Mock the module
jest.mock('./todoListService');

// Import it, so we have access to it. 
import {fetchTodos} from "./todoListService";

describe.skip('Example 1b - <TodoList/>', () => {
    it("Shows the todo after loading has completed", async () => {
 
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
