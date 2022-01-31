import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import React from 'react';
import { FetchTodosProvider } from './FetchTodosProvider';
import { TodoList } from './TodoList';
import {TextContextProvider} from "./testUtils/TestUtils";

describe('Example 3 - utils example - <TodoList/>', () => {
    it.only("Shows the todo after loading has completed", async () => {
        


        render(
        <TextContextProvider>
            <TodoList />
        </TextContextProvider>
        );




        // Assert that the loading text is there 
        const loadingText = screen.getByText("Loading...");
        expect(loadingText).toBeInTheDocument();

        // Wait for the loading text to disappear
        await waitForElementToBeRemoved(loadingText);


        screen.debug();
        // Check for the existence of one of our todos
        const todoText = screen.getByText("foo");
        expect(todoText).toBeInTheDocument();

    });

    it("Changing the functionality of the fetchTodos function", async () => {
        

        const fakeFetchTodos = jest.fn().mockResolvedValue([
            {
                "userId": 1,
                "id": 1,
                "title": "bar", // changed title to bar 
                "completed": false
              },
        ]);


        render(
        <TextContextProvider fetchTodos = {fakeFetchTodos}>
            <TodoList />
        </TextContextProvider>
        );



        // Assert that the loading text is there 
        const loadingText = screen.getByText("Loading...");
        expect(loadingText).toBeInTheDocument();

        // Wait for the loading text to disappear
        await waitForElementToBeRemoved(loadingText);

        // Check for the existence of one of our todos
        const todoText = screen.getByText("bar");
        expect(todoText).toBeInTheDocument();

        // Check that fakeFetchTodos was called just once
        expect(fakeFetchTodos).toHaveBeenCalledTimes(1);
    });
});
