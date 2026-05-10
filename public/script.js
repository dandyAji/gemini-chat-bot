const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const welcomeScreen = document.getElementById("welcome-screen");

let conversationHistory = [];
window.firstMessage = true;

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Sembunyikan welcome screen saat pesan pertama dikirim
  if (window.firstMessage) {
    welcomeScreen.style.display = "none";
    window.firstMessage = false;
  }

  appendMessage("user", userMessage);
  conversationHistory.push({ role: "user", text: userMessage });
  input.value = "";
  input.focus();

  const botEl = appendMessage("bot", "");
  showTyping(botEl);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation: conversationHistory }),
    });

    if (!response.ok) throw new Error("Network error");
    const data = await response.json();

    removeTyping(botEl);

    if (data && data.result) {
      botEl.querySelector(".message-content").textContent = data.result;
      conversationHistory.push({ role: "model", text: data.result });
    } else {
      botEl.querySelector(".message-content").textContent = "Maaf, tidak ada respons yang diterima.";
    }
  } catch (error) {
    console.error("Error:", error);
    removeTyping(botEl);
    botEl.querySelector(".message-content").textContent = "Gagal terhubung ke server. Silakan coba lagi.";
  }
});

function appendMessage(sender, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `message flex ${sender === "user" ? "justify-end" : "justify-start"} px-4 py-2`;
  wrapper.style.cssText = "padding-left:24px;padding-right:24px;";

  const inner = document.createElement("div");
  inner.className = "flex items-end gap-2.5";
  inner.style.cssText = `max-width:680px;width:100%;flex-direction:${sender === "user" ? "row-reverse" : "row"};display:flex;align-items:flex-end;gap:10px;`;

  // Avatar
  const avatar = document.createElement("div");
  avatar.style.cssText = "width:32px;height:32px;border-radius:" + (sender === "user" ? "50%" : "10px") + ";display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-bottom:2px;";
  if (sender === "user") {
    avatar.style.background = "linear-gradient(135deg,#7c3aed,#6366f1)";
    avatar.innerHTML = `<span style="color:white;font-size:12px;font-weight:600;">U</span>`;
  } else {
    avatar.style.background = "linear-gradient(135deg,#6366f1,#7c3aed)";
    avatar.innerHTML = `<svg style="width:16px;height:16px;color:white;" fill="none" viewBox="0 0 24 24" stroke="white"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`;
  }

  // Bubble
  const bubble = document.createElement("div");
  bubble.style.cssText = `padding:13px 18px;font-size:14px;line-height:1.65;${sender === "user" ? "background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;border-radius:20px 20px 4px 20px;" : "background:#13131f;border:1px solid rgba(255,255,255,0.07);color:#cbd5e1;border-radius:20px 20px 20px 4px;"}`;

  const content = document.createElement("div");
  content.className = "message-content";
  content.style.fontFamily = "'Sora', sans-serif";
  content.textContent = text;

  bubble.appendChild(content);
  inner.appendChild(avatar);
  inner.appendChild(bubble);
  wrapper.appendChild(inner);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;

  return wrapper;
}

function showTyping(el) {
  el.querySelector(".message-content").innerHTML = `
    <div style="display:flex;align-items:center;gap:5px;padding:2px 0;">
      <span class="dot" style="width:7px;height:7px;border-radius:50%;background:#6366f1;"></span>
      <span class="dot" style="width:7px;height:7px;border-radius:50%;background:#6366f1;"></span>
      <span class="dot" style="width:7px;height:7px;border-radius:50%;background:#6366f1;"></span>
    </div>`;
}

function removeTyping(el) {
  el.querySelector(".message-content").innerHTML = "";
}
