const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
};

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);

    autoscroll();
});

/*
    Goal: Create a separate event for location sharing messages

    1. Have server emit "locationMessage" with the URL
    2. Have the client listen for "locationMessage" and print the URL to the console
    3. Test your work by sharing a location
*/

/*
    Goal: Render new template for location messages

    1. Duplicate the message template
        - Change the id to something else
    2. Add a link inside the paragraph with the link text "My current location"
        - URL for link should be the maps URL (dynamic)
    3. Select the template from JavaScript
    4. Render the template with the URL and append to messages list
    5. Test you work!
*/

/*
    Goal: Add timestamps for location messages
    
    1. Create generateLocationMessage and export
        - { url: '', createdAt: 0 }
    2. Use generateLocationMessage when server emits locationMessage
    3. Update template to render time before the url
    4. Compile the template with the URL and the formatted time
    5. Test your work!
*/

const urlTemplate = document.querySelector('#url-template').innerHTML;

socket.on('locationMessage', (message) => {
    console.log(message);
    const html = Mustache.render(urlTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);

    autoscroll();
});

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

socket.on('roomData', ({ room , users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // disable the button
    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = e.target.elements.message.value;
    socket.emit('sendMessage', message, (error) => {
        // enable the button & clear input
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if(error) {
            return console.log(error);
        }

        console.log('Message delivered!');
    });
});

/*
    Goal: Share coordinates with other users

    1. Have client emit "sendLocation" with n object as the data
        - Object should contain latitude and longitude properties
    2. Server should listen for "sendLocation"
        - When fired, send a "message" to all connected clients "Location: lat, long"
    3. Test your work!
*/

/*
    Goal: Setup acknowledgement

    1. Setup the client acknowledgement function
    2. Setup the server to send back the acknowledgement
    3. Have the client print "Location shared!" when acknowledged
    4. Test your work!
*/

/*
    Goal: Disable the send location button while location being sent

    1. Set up a selection at the top of the file
    2. Disable the button just before getting the current position
    3. Enable the button in the acknowledgement callback
    4. Test your work!
*/

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }

    // disable button
    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', { 
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) => {
            // enable button
            $sendLocationButton.removeAttribute('disabled');
            
            if(error) {
                return console.log(error);
            }

            console.log('Location shared!');
        });
    });
});

socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error);
        location.href = '/';
    }
});

// Counter Example of Real time communication
// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated', count);
// });

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked');
//     socket.emit('increment');
// })