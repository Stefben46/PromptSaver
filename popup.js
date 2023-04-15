document.addEventListener('DOMContentLoaded', function() {

  // Get elements from HTML document
  const messagesDiv = document.getElementById("messages");
  const newMessageForm = document.getElementById("new-message-form");
  const newMessageButton = document.getElementById("new-message-button");
  const searchInput = document.getElementById("search-bar");

  // Render the messages in the popup
  function renderMessages(filteredMessages = []) {
    chrome.storage.sync.get(["messages"], result => {
      const messages = result.messages || [];
      messagesDiv.innerHTML = "";

      const messagesToRender = filteredMessages.length > 0 ? filteredMessages : messages;

      messagesToRender.forEach((message, index) => {
        // Create a div to hold the message box
        const messageBox = document.createElement("div");
        messageBox.classList.add("message-box");

        // Create a div to hold the title and message body
        const messageContentDiv = document.createElement("div");
        messageContentDiv.classList.add("message-content");

        // Create a div to hold the title and delete button
        const titleDiv = document.createElement("div");
        titleDiv.classList.add("titlediv");

        // Create a delete button
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("button");
        deleteButton.classList.add("delete");
        deleteButton.innerHTML = "&#10006";
        deleteButton.addEventListener("click", () => {
          // Remove the message from storage and re-render the messages
          chrome.storage.sync.get("messages", result => {
            const messages = result.messages || [];
            messages.splice(index, 1);
            chrome.storage.sync.set({ messages }, () => {
              renderMessages();
            });
          });
        });

        // Create a title element
        const titleElement = document.createElement("h3");
        titleElement.classList.add("title");
        titleElement.innerText = message.title;

        // Append the title element and delete button to title div
        titleDiv.appendChild(titleElement);
        titleDiv.appendChild(deleteButton);

        // Append the title div to message box
        messageBox.appendChild(titleDiv);

         // Create a message body element
        const messageElement = document.createElement("p");
        messageElement.classList.add("message-body");
        messageElement.innerText = message.message;
        messageContentDiv.appendChild(messageElement);

        // Create a div to hold the copy and edit buttons
        const buttonDiv = document.createElement("div");
        buttonDiv.classList.add("button-group");

        // Create a copy button
        const copyButton = document.createElement("button");
        copyButton.classList.add("button");
        copyButton.classList.add("copy");
        copyButton.innerHTML = "Copy";
        copyButton.addEventListener("click", () => {
          // Copy the message to the clipboard
          navigator.clipboard.writeText(message.message);
          copyButton.innerHTML = "Copied";
          setTimeout(() => {
            copyButton.innerHTML = "Copy";
          }, 1000);
        });
        buttonDiv.appendChild(copyButton);

        // Create an edit button
        const editButton = document.createElement("button");
        editButton.classList.add("button");
        editButton.classList.add("edit");
        editButton.innerHTML = "Edit";
        editButton.addEventListener("click", () => {
          // Show the form to edit the message
          newMessageForm.style.display = "block";
          newMessageButton.style.display = "none";
          document.getElementById("title").value = message.title;
          document.getElementById("message").value = message.message;

          // Remove the message from storage and re-render the messages after editing
          chrome.storage.sync.get("messages", result => {
            const messages = result.messages || [];
            messages.splice(index, 1);
            chrome.storage.sync.set({ messages }, () => {
              renderMessages();
              window.scrollTo(0, 0);
            });
          });
        });
        buttonDiv.appendChild(editButton);

        // Append message content and button divs to message box
        messageBox.appendChild(messageContentDiv);
        messageBox.appendChild(buttonDiv);

        // Append the message box to messages div
        messagesDiv.appendChild(messageBox);
      });
    });
  }

  // Show form to add new message
  newMessageButton.addEventListener("click", () => {
      newMessageForm.style.display = "block";
      newMessageButton.style.display = "none";
  });

  // Filter messages based on search input
  searchInput.addEventListener("input", event => {
      const query = event.target.value.toLowerCase();
      chrome.storage.sync.get(["messages"], result => {
        const messages = result.messages || [];
        const filteredMessages = messages.filter(
          message =>
            message.title.toLowerCase().includes(query) ||
            message.message.toLowerCase().includes(query)
        );
        renderMessages(filteredMessages);
      });
    });

  // Add new message to storage and re-render messages
  newMessageForm.addEventListener("submit", e => {
      e.preventDefault();
      const title = document.getElementById("title").value;
      const message = document.getElementById("message").value;
      chrome.storage.sync.get("messages", result => {
        const messages = result.messages || [];
        messages.push({ title, message });
        chrome.storage.sync.set({ messages }, () => {
          renderMessages();
          newMessageForm.reset();
          newMessageForm.style.display = "none";
          newMessageButton.style.display = "block";
        });
      });
    });

  // Initialize the popup and show all messages
  renderMessages();

});
