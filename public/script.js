const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

// Maintain conversation history to send to the backend
let conversationHistory = [];

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // 1. Add user message to UI and history
  appendMessage("user", userMessage);
  conversationHistory.push({ role: "user", text: userMessage });
  input.value = "";

  // 2. Show "Thinking..." placeholder
  const botMessageElement = appendMessage("bot", "Gemini is thinking...");

  try {
    // 3. Send request to backend
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conversation: conversationHistory }),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();

    // 4. Update UI with response or error message
    if (data && data.result) {
      botMessageElement.textContent = data.result;
      conversationHistory.push({ role: "model", text: data.result });
    } else {
      botMessageElement.textContent = "Sorry, no response received.";
    }
  } catch (error) {
    console.error("Error fetching chat:", error);
    botMessageElement.textContent = "Failed to get response from server.";
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg; // Return the element so it can be updated later
}
