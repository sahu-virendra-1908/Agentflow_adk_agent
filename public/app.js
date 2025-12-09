// public/app.js

const chatEl = document.getElementById("chat");
const formEl = document.getElementById("chat-form");
const inputEl = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const statusEl = document.getElementById("status");

function appendMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className =
    "flex items-start gap-2 sm:gap-3 " +
    (role === "user" ? "justify-end" : "justify-start");

  const bubble = document.createElement("div");
  bubble.className =
    "max-w-[80%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm whitespace-pre-wrap";

  if (role === "user") {
    bubble.className +=
      " bg-emerald-500 text-slate-950 rounded-tr-sm shadow-lg shadow-emerald-500/30";
  } else {
    bubble.className +=
      " bg-slate-800/80 border border-slate-700/80 rounded-tl-sm text-slate-100";
  }

  bubble.textContent = text;
  wrapper.appendChild(bubble);
  chatEl.appendChild(wrapper);

  // scroll to bottom
  chatEl.scrollTop = chatEl.scrollHeight;
}

function setLoading(isLoading) {
  sendBtn.disabled = isLoading;
  if (isLoading) {
    statusEl.textContent = "Thinking with AgentFlow...";
  } else {
    statusEl.textContent = "Connected to AgentFlow backend.";
  }
}

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = inputEl.value.trim();
  if (!message) return;

  appendMessage("user", message);
  inputEl.value = "";
  setLoading(true);

  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const errorMsg =
        data?.error ||
        `Request failed with status ${res.status}. Please try again.`;
      appendMessage(
        "agent",
        "⚠️ " + errorMsg
      );
      setLoading(false);
      return;
    }

    const data = await res.json();
    appendMessage("agent", data.reply ?? "(empty response)");
  } catch (err) {
    console.error(err);
    appendMessage(
      "agent",
      "⚠️ Network or server error. Check console/logs for details."
    );
  } finally {
    setLoading(false);
  }
});

// Quick templates in side panel
document.querySelectorAll("[data-template]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const text = btn.getAttribute("data-template");
    inputEl.value = text;
    inputEl.focus();
  });
});
