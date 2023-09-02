// DOM elements
const messageForm = document.querySelector("#message-form");
const messageInput = document.querySelector("#message-input");
const messageContainer = document.querySelector(".message-container");
const channelButtons = document.querySelectorAll(".channel-button");
const selectedChannelInput = document.querySelector("#selected-channel");
const createChannelButton = document.querySelector("#create-channel-button");
const newChannelNameInput = document.querySelector("#new-channel-name");

createChannelButton.addEventListener("click", function () {
    const newChannelName = newChannelNameInput.value;
    if (newChannelName.trim() !== "") {
        createNewChannel(newChannelName);
    }
});


channelButtons.forEach(button => {
    button.addEventListener("click", function() {
        const channel = this.getAttribute("data-channel");
        selectedChannelInput.value = channel;
        fetchAndDisplayMessages(channel);
    });
});

// Add submit event listener to message form
messageForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const message = messageInput.value;
    if (message.trim() !== "") {
        sendMessageToServer(message);
        messageInput.value = "";
    }
});

function createNewChannel(channelName) {
    fetch(`/create_channel?channel=${channelName}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show the success message
                const successMessage = document.querySelector("#success-message");
                successMessage.style.display = "block";

                // Refresh the channel list and select the newly created channel
                fetchAndDisplayChannels();
                selectedChannelInput.value = channelName;
                fetchAndDisplayMessages(channelName);
            }
        })
        .catch(error => {
            console.error("Error creating channel:", error);
        });
}


// Fetch and display messages for a specific channel
function fetchAndDisplayMessages(channel) {
    fetch(`/load_messages?channel=${channel}`)
        .then(response => response.json())
        .then(data => {
            if (data.channel === selectedChannelInput.value) {
                messageContainer.innerHTML = ""; // Clear the container
                data.messages.forEach(messageData => {
                const username = messageData.username;
                const message = messageData.message;
                const timestamp = messageData.timestamp;  // Retrieve the timestamp
                displayMessage(username, message, timestamp);
            });
            }
        })
        .catch(error => {
            console.error("Error loading messages:", error);
        });
}

// Display a message in the message container
// Display a message in the message container
function displayMessage(username, message, timestamp) {
    const messageBubble = document.createElement("div");
    messageBubble.className = "message-bubble";

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    messageContent.textContent = `${username}: ${message}`;

    const timestampElement = document.createElement("div");
    timestampElement.className = "timestamp";
    timestampElement.textContent = timestamp;

    messageBubble.appendChild(messageContent);
    messageBubble.appendChild(timestampElement);
    messageContainer.appendChild(messageBubble);

    // Scroll to the bottom of the message container
    messageContainer.scrollTop = messageContainer.scrollHeight;
}




// Send a message to the server
function sendMessageToServer(message) {
    const data = {
        message: message,
        selected_channel: selectedChannelInput.value
    };

    socket.emit('send_message_event', data); // Emit the send_message_event event
}

// Load messages for the initial channel on window load
// Load messages for the initial channel on window load
window.addEventListener('load', function () {
    const initialChannel = selectedChannelInput.value;
    fetchAndDisplayMessages(initialChannel);
    scrollToBottom();
});

// Scroll to the bottom of the container
function scrollToBottom() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
}
