const users = [];

// Add User
const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if(!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find(
        user => user.room === room && user.username === username
    );

    // Validate username
    if(existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { id, username, room };
    users.push(user);

    return { user };
};

// Remove User
const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);

    if(index !== -1) {
        return users.splice(index, 1)[0];
    }
};

/*
    Goal: Create 2 new functions for users

    1. Create getUser
        - Accept id and return user object (or undefined)
    2. Create getUsersInRoom
        - Accept room name and return array of users (or empty array)
    3. Test your work by calling the functions!
*/

// Get User
const getUser = (id) => {
    return users.find(user => user.id === id);
};

// Get Users in a room
const getUsersInRoom = (room) => {
    return users.filter(user => user.room === room);
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}