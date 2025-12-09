// public/app.js

document.addEventListener("DOMContentLoaded", () => {
  const chatEl = document.getElementById("chat");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const statusEl = document.getElementById("status");

  const backtestPanel = document.getElementById("backtest-panel");
  const backtestSummaryEl = document.getElementById("backtest-summary");
  const backtestCanvas = document.getElementById("backtest-chart");

  function appendMessage(role, text) {
    const wrapper = document.createElement("div");
    wrapper.className =
      "flex items-start gap-2 sm:gap-3 " +
      (role === "user" ? "justify-end" : "justify-start");

    const bubble = document.createElement("div");
    const baseBubble =
      "max-w-[80%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm whitespace-pre-wrap";

    if (role === "user") {
      bubble.className =
        baseBubble +
        " rounded-tr-sm bg-emerald-500 text-slate-950 border border-emerald-400/70";
    } else {
      bubble.className =
        baseBubble +
        " rounded-tl-sm bg-slate-800/70 text-slate-100 border border-slate-700/80";
    }

    bubble.textContent = text;

    if (role === "assistant") {
      const avatar = document.createElement("div");
      avatar.className =
        "h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-xs sm:text-sm";
      avatar.textContent = "AF";
      wrapper.appendChild(avatar);
      wrapper.appendChild(bubble);
    } else {
      wrapper.appendChild(bubble);
    }

    chatEl.appendChild(wrapper);
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  function setLoading(isLoading) {
    sendBtn.disabled = isLoading;
    if (isLoading) {
      statusEl.textContent = "Thinking...";
    } else {
      statusEl.innerHTML =
        '<span class="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block mr-1"></span>Connected to AgentFlow backend.';
    }
  }

  // Extract BACKTEST_DATA JSON block from assistant reply (if present)
  function extractBacktestData(text) {
    const marker = "BACKTEST_DATA:";
    const idx = text.indexOf(marker);
    if (idx === -1) {
      return { cleanText: text, backtest: null };
    }

    // Everything before marker is normal message
    const cleanText = text.slice(0, idx).trim();

    // Try to find ```json ... ``` block after marker
    const after = text.slice(idx + marker.length);
    const codeBlockMatch = after.match(/```json([\s\S]*?)```/);
    if (!codeBlockMatch) {
      return { cleanText, backtest: null };
    }

    const jsonStr = codeBlockMatch[1].trim();
    try {
      const backtest = JSON.parse(jsonStr);
      return { cleanText, backtest };
    } catch (e) {
      console.warn("Failed to parse BACKTEST_DATA JSON:", e);
      return { cleanText, backtest: null };
    }
  }

  // Simple line chart without external libs
  function renderBacktestChart(backtest) {
    if (!backtestCanvas || !backtest || !backtest.equityCurve) return;

    const ctx = backtestCanvas.getContext("2d");
    if (!ctx) return;

    const series = backtest.equityCurve;
    if (!series.length) return;

    const width = backtestCanvas.width || backtestCanvas.clientWidth;
    const height = backtestCanvas.height || backtestCanvas.clientHeight;

    // Adjust canvas size to CSS size
    backtestCanvas.width = backtestCanvas.clientWidth * window.devicePixelRatio;
    backtestCanvas.height =
      backtestCanvas.clientHeight * window.devicePixelRatio;

    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, width, height);

    const values = series.map((p) => p.equity);
    const min = Math.min(...values);
    const max = Math.max(...values);

    const padding = 8;
    const innerW = width - padding * 2;
    const innerH = height - padding * 2;

    function xForIndex(i) {
      if (series.length === 1) return padding + innerW / 2;
      return padding + (innerW * i) / (series.length - 1);
    }

    function yForValue(v) {
      if (max === min) return padding + innerH / 2;
      const t = (v - min) / (max - min);
      return padding + innerH - t * innerH;
    }

    // Axis line (light)
    ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding + innerH);
    ctx.lineTo(padding + innerW, padding + innerH);
    ctx.stroke();

    // Equity curve
    ctx.strokeStyle = "rgba(45, 212, 191, 0.9)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    series.forEach((pt, i) => {
      const x = xForIndex(i);
      const y = yForValue(pt.equity);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Small gradient fill under curve (optional)
    const gradient = ctx.createLinearGradient(
      0,
      padding,
      0,
      padding + innerH
    );
    gradient.addColorStop(0, "rgba(45, 212, 191, 0.18)");
    gradient.addColorStop(1, "rgba(15, 23, 42, 0.0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    series.forEach((pt, i) => {
      const x = xForIndex(i);
      const y = yForValue(pt.equity);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(
      padding + innerW,
      padding + innerH
    );
    ctx.lineTo(padding, padding + innerH);
    ctx.closePath();
    ctx.fill();

    // Update summary panel
    if (backtestSummaryEl) {
      backtestSummaryEl.textContent =
        backtest.summary ||
        `Total return: ${backtest.totalReturnPct}% over ${backtest.lookbackDays} days.`;
    }
    if (backtestPanel) {
      backtestPanel.classList.remove("hidden");
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    appendMessage("user", message);
    input.value = "";
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
        const err = await res.json().catch(() => ({}));
        const msg =
          err?.error || `Request failed with status ${res.status}`;
        appendMessage("assistant", `❌ Error: ${msg}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const rawReply = String(data.reply ?? "");
      const { cleanText, backtest } = extractBacktestData(rawReply);

      appendMessage("assistant", cleanText || rawReply);

      if (backtest) {
        renderBacktestChart(backtest);
      }
    } catch (err) {
      console.error(err);
      appendMessage(
        "assistant",
        "❌ Network error talking to AgentFlow backend."
      );
    } finally {
      setLoading(false);
    }
  });

  // Quick ideas click handlers
  document
    .querySelectorAll("[data-template]")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const tmpl = btn.getAttribute("data-template");
        if (!tmpl) return;
        input.value = tmpl;
        input.focus();
      });
    });
});
