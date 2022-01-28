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
