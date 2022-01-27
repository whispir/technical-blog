import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { UserProfile } from './UserProfile';

describe('<UserProfile/>', () => {
    it("Doesn't crash on render", () => {


        // Initial state
        const user = {
            name: "Bob",
            email: "bob@foo.com",
        }; 
        const fakeSaveUser = jest.fn();


        // Render the component
        render(<UserProfile user={user}
            onSaveUser={fakeSaveUser}
        />);


        // Check that the text is in the screen. 
        const textName = screen.getByText("Bob");
        expect(textName).toBeInTheDocument();


        const textEmail = screen.getByText("bob@foo.com");
        expect(textEmail).toBeInTheDocument();


        // Check that the button is on the screen. 
        const button = screen.getByRole("button", {
            name: "Edit"
        }); 

        // Click the button 
        userEvent.click(button);

        // Check that the text has changed
        expect(button.textContent).toBe("Save Changes"); 

        // Check that the inputs are in the screen
        const inputName = screen.getByRole("textbox", {
            name: "Name"
        }); 

        expect(inputName).toBeInTheDocument();


        const inputEmail = screen.getByRole("textbox", {
            name: "Contact Email"
        }); 

        expect(inputEmail).toBeInTheDocument();

        // Type in the input 
        userEvent.clear(inputName);
        userEvent.type(inputName, "Robert"); 

        // Click the button 
        userEvent.click(button); 


        // Check that the callback was fired
        expect (fakeSaveUser).toHaveBeenCalledWith({
            name: "Robert", 
            email: "bob@foo.com"
        })
    });
});
