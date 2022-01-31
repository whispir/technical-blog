import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import React from 'react';
import { UserProfile } from './UserProfile';
import { setFetchTodosFn, TodoList } from './TodoList';

describe('<UserProfile/>', () => {
    it("Shows the todo after loading has completed", async () => {

        setFetchTodosFn(jest.fn().mockResolvedValue([
            {
                "userId": 1,
                "id": 1,
                "title": "foo",
                "completed": false
            },
        ]));


        render(<UserProfile />);


        // It wouldn't be a good idea to actually write tests like this for UserProfile 
        // This logic should be tested in TodoList
        // But what we're doing here to just writing a test to show that the real API is not being called
        // For the purposes of demonstration

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
