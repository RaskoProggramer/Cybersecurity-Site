document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('chatbot-toggle');
  const container = document.getElementById('chatbot-container');
  const closeBtn = document.getElementById('chatbot-close');
  const sendBtn = document.getElementById('chatbot-send');
  const input = document.getElementById('chatbot-text');
  const messages = document.getElementById('chatbot-messages');

  // Open chatbot
  toggleBtn.addEventListener('click', () => container.style.display = 'flex');

  // Close chatbot
  closeBtn.addEventListener('click', () => container.style.display = 'none');

  // Send message
  const sendMessage = async () => {
    const text = input.value.trim();
    if (!text) return;

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.textContent = `You: ${text}`;
    userMsg.style.color = '#00ffff';
    messages.appendChild(userMsg);
    messages.scrollTop = messages.scrollHeight;

    input.value = '';

    // Placeholder response
    const botMsg = document.createElement('div');
    botMsg.textContent = 'CyberSP Bot: Let me find that out...';
    botMsg.style.color = '#ff00ff';
    messages.appendChild(botMsg);
    messages.scrollTop = messages.scrollHeight;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      botMsg.textContent = `CyberSP Bot: ${data.reply}`;
      messages.scrollTop = messages.scrollHeight;
    } catch (err) {
      botMsg.textContent = 'CyberSP Bot: Sorry, something went wrong.';
      messages.scrollTop = messages.scrollHeight;
    }
  };

  // Attach listeners (outside the function ✅)
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
  });
});
