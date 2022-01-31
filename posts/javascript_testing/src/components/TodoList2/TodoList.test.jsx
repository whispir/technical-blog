import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import React from 'react';
import { TodoList } from './TodoList';

describe('<TodoList/>', () => {
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

        render(<TodoList fetchTodos = {fakeFetchTodos} />);



        // Assert that the loading text is there 
        const loadingText = screen.getByText("Loading...");
        expect(loadingText).toBeInTheDocument();

        // Wait for the loading text to disappear
        await waitForElementToBeRemoved(loadingText);

        // Check for the existence of one of our todos
        const todoText = screen.getByText("foo");
        expect(todoText).toBeInTheDocument();

        // Check that fakeFetchTodos was called just once
        expect(fakeFetchTodos).toHaveBeenCalledTimes(1);
    });
});
