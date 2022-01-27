import React, { useState } from 'react';

export const UserProfile = (props) => {
    const { user, onSaveUser } = props;


    const [isEditing, setIsEditting] = useState(false);

    const [newUser, setNewUser] = useState(user);

    /**
     * nb. 
     * 
     * This is not a particularly good way to implement this component. 
     * You can see that if there were more properties on a user (DOB, favourite color, phone number etc)
     * We would be doing a lot of copy pasting. 
     * 
     * For the purposes of this example, I'm keeping things simple.
     */

    const handleUserNameChange = (e) => {
        setNewUser({
            ...newUser,
            name: e.target.value
        });
    }

    const handleUserEmailChange = (e) => {
        setNewUser({
            ...newUser,
            email: e.target.value
        })
    }

    const handleButtonClick = () => {
        setIsEditting(!isEditing);
        if (isEditing) {
            onSaveUser(newUser);
        }
    }

    return <div>
        <table>
            <tbody>
                <tr>
                    <td>
                        <label htmlFor = "Name">Name</label>
                    </td>
                    <td>
                        {isEditing ? <input type="text" defaultValue={user.name} onChange={handleUserNameChange} id="Name" /> : <span>{user.name}</span>}
                    </td>
                </tr>
                <tr>
                    <td>
                        <label htmlFor = "Contact Email">Contact Email</label>
                    </td>
                    <td>
                        {isEditing ? <input type="text" defaultValue={user.email} onChange={handleUserEmailChange} id="Contact Email" /> : <span>{user.email}</span>}
                    </td>
                </tr>
            </tbody>
        </table>


        <button onClick={handleButtonClick}>{isEditing ? "Save Changes" : "Edit"}</button>
    </div>;
};
