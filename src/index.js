/*
    Goal: Create an Express web server

    1. Initialize npm and install Express
    2. Setup a new Express server
        - Serve up the public directory
        - Listen on port 3000
    3. Create index.html and render "Chat App" on the screen
    4. Test your work! Start the server and view the page in the browser
*/

const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Serve the public folder static asset
app.use(express.static(path.join(__dirname, '../public')));

// let count = 0;

/*
    Goal: Send a welcome message to new users

    1. Have server emit "message" when new client connects
        - Send "Welcome!" as the event data
    2. Have client listen for "message" event and print the message to console
    3. Test your work!
*/

/*
    Goal: Allow clients to send messages

    1. Create a form with an input and button
        - Similar to the weather form
    2. Setup event listener for form submissions
        - Emit "sendMessage" with input string as message data
    3. Have server listen for "sendMessage"
        - Send message to all connected clients
    4. Test your work!
*/

io.on('connection', (socket) => {
    console.log('New WebSocet connection');

    socket.on('join', (options, callback) => {

        // Add the User
        const { error, user } = addUser({ id: socket.id, ...options });
        if(error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message', generateMessage('Admin', 'Welcome!'));
        // Emit to every client except current within the room
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));

        // Send room data to client on join
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();
    });

    /*
        Goal: Send messages to correct room

        1. Use getUser inside "sendMessage" event handler to get the user data
        2. Emit the message to their currnt room
        3. Test your work!
        4. Repeat for "sendLocation"
    */

    /*
        Goal: Render username ffor text messages

        1. Setup the server to send username to client
        2. Edit every call to "generateMessage" to include username
            - Use "Admin" for sys messages like connect/welcom/disconnect
        3. Update client to render username in template
        4. Test your work!
    */

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();

        if(filter.isProfane(message)) {
            return callback('Profanity is not allowed!');
        }

        const user = getUser(socket.id);

        if(user) {
            io.to(user.room).emit('message', generateMessage(user.username, message));
            callback();
        }
    });

    socket.on('sendLocation', ({ latitude, longitude }, callback) => {
        const user = getUser(socket.id);

        if(user) {
            io.to(user.room).emit('locationMessage', 
                generateLocationMessage(user.username, `https://google.com/maps?q=${latitude},${longitude}`)
            );
            callback();
        }
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`));

            // Send room data to client on leave
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });

    // Counter Example of Real time communication
    // Server sending event "countUpdated" to the single client
    // socket.emit('countUpdated', count);

    // // Server processing the "increment" event from client
    // socket.on('increment', () => {
    //     count++;
    //     // socket.emit('countUpdated', count);
    //     // Server sends message to all clients
    //     io.emit('countUpdated', count);
    // })
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

/*
    Goal: Setup scripts in package.json

    1. Create a "start" script to start the app using node
    2. Install nodemon and a development dependency
    3. Create a "dev" script to start the app using nodemon
    4. Run both scripts to test your work!
*/