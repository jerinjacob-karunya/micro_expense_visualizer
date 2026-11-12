// chatbot.js - offline assistant chatbot (FR-06).
// No server and no AI model: it looks for KEYWORDS in the question and picks a ready-made reply.
// The chat history is saved in localStorage so it survives page changes.

// Each topic has a list of keywords and a reply (text, or a function that returns text).
// Topics are checked from top to bottom; the first match wins.
const chatTopics = [
  {
    keywords: ["hello", "hi", "hey", "hii", "namaste"],
    reply: "Hi! I'm the MEV helper. Ask me about adding expenses, the dashboard, your budget, the ledger or the calculator."
  },
  {
    keywords: ["spend", "spent", "total", "how much"],
    reply: function () {
      const session = getSession();
      if (!session) return "Sign in first and I can tell you how much your expenses add up to.";
      const expenses = getExpenses(session.userId);
      if (expenses.length === 0) return "You haven't added any expenses yet. Try the Add page.";
      const monthly = totalMonthly(expenses);
      return "You have " + expenses.length + " expenses costing about " + formatMoney(monthly) +
        " a month, or " + formatMoney(monthly * 12) + " a year.";
    }
  },
  {
    keywords: ["invest", "invested", "growth", "compound", "10-year", "ten year", "7%"],
    reply: "The 10-year figure shows what your monthly total could grow to if you invested it instead, at 7% a year compounded monthly. It's an estimate, not financial advice."
  },
  {
    keywords: ["daily", "30.44", "convert", "conversion"],
    reply: "Daily costs are multiplied by 30.44 (the average days in a month) so every expense can be compared on one monthly scale."
  },
  {
    keywords: ["annual", "yearly", "year"],
    reply: "Annual cost = your monthly total x 12. It shows what a year of small charges really adds up to."
  },
  {
    keywords: ["budget", "threshold", "limit", "salary", "income", "goal"],
    reply: "Set your income, monthly budget and savings goal on the Profile page. The dashboard then shows how much of your budget is used: green is under 50%, amber is 50-89%, red is 90% or more."
  },
  {
    keywords: ["add", "preset", "presets", "log expense", "create expense"],
    reply: "Open the Add page. Fill in the category, name, cost and frequency, or tap a preset to add a common expense in one click."
  },
  {
    keywords: ["edit", "delete", "remove", "ledger", "search", "filter"],
    reply: "The Ledger page lists every expense. Use the category buttons or the search box to find one, then press Edit to change it or Delete to remove it."
  },
  {
    keywords: ["dashboard", "overview", "drain", "home"],
    reply: "The Dashboard shows your monthly drain, annual cost, 10-year invested potential, budget progress and a category breakdown."
  },
  {
    keywords: ["register", "registration", "signup", "sign up", "account"],
    reply: "Use Sign up for a quick account (email and password) or the Register page for the full form with Register ID, mobile number and division."
  },
  {
    keywords: ["login", "log in", "signin", "sign in", "password", "forgot"],
    reply: "Use the Sign in page with the email and password you created. This demo keeps accounts in your browser only, so there is no password reset."
  },
  {
    keywords: ["theme", "dark", "light", "mode"],
    reply: "Use the moon / sun button in the header to switch between light and dark mode. Your choice is remembered."
  },
  {
    keywords: ["calculator", "calculate", "calc"],
    reply: "Tap the calculator button just left of this chat button. It works with the keyboard too, and it shows an error if you divide by zero."
  },
  {
    keywords: ["privacy", "data", "offline", "storage", "safe", "secure", "server"],
    reply: "Everything stays in this browser (localStorage). There is no server, and I work fully offline using keyword matching."
  },
  {
    keywords: ["thanks", "thank", "bye", "ok"],
    reply: "You're welcome! Ask me anything else about MEV."
  },
  {
    keywords: ["help", "what can you do", "options"],
    reply: "I can explain: adding expenses, the dashboard, the budget colours, the 10-year figure, the ledger, accounts, dark mode and the calculator. You can also ask \"how much do I spend?\"."
  }
];

const fallbackReply = "Sorry, I don't know that one yet. Try asking about adding expenses, the dashboard, your budget, the ledger, dark mode or the calculator.";

// Does the message contain this keyword?
// Plain words must match a whole word ("hi" must not match "this"); phrases and symbols use includes().
function messageHasKeyword(message, words, keyword) {
  if (/^[a-z]+$/.test(keyword)) {
    return words.includes(keyword);
  }
  return message.includes(keyword);
}

function getBotReply(userText) {
  const message = userText.toLowerCase();
  const words = message.split(/[^a-z0-9]+/);

  for (const topic of chatTopics) {
    for (const keyword of topic.keywords) {
      if (messageHasKeyword(message, words, keyword)) {
        return typeof topic.reply === "function" ? topic.reply() : topic.reply;
      }
    }
  }
  return fallbackReply;
}

// ----- Building the chat window -----
let chatHistory = loadLocal(CHAT_KEY, []);
let chatLog = null;
let chatInput = null;

function addChatMessage(sender, text, saveIt) {
  const node = document.createElement("div");
  node.className = sender === "user" ? "user-msg" : "bot-msg";
  node.textContent = text; // textContent (not innerHTML) keeps typed text safe from XSS
  chatLog.appendChild(node);
  chatLog.scrollTop = chatLog.scrollHeight; // auto-scroll to the newest message

  if (saveIt) {
    chatHistory.push({ sender: sender, text: text });
    chatHistory = chatHistory.slice(-40); // keep only the last 40 messages
    saveLocal(CHAT_KEY, chatHistory);
  }
}

function buildChatWidget() {
  // Floating action button, fixed to the bottom-right corner
  const fab = document.createElement("button");
  fab.type = "button";
  fab.id = "chatFab";
  fab.className = "chat-fab";
  fab.innerHTML =
    '<svg class="icon-chat" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9l-5 4V5a1 1 0 0 1 1-1z" fill="currentColor"/></svg>' +
    '<svg class="icon-close" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>';
  fab.setAttribute("aria-label", "Open chat assistant");
  fab.setAttribute("aria-expanded", "false");
  fab.setAttribute("aria-controls", "chatPanel");

  // Chat panel (hidden until the button is pressed)
  const panel = document.createElement("section");
  panel.id = "chatPanel";
  panel.className = "float-panel chat-panel";
  panel.dataset.fab = "chatFab";
  panel.setAttribute("aria-label", "MEV chat assistant");
  panel.innerHTML =
    '<div class="chat-head"><strong>MEV Assistant</strong>' +
    '<button type="button" class="chat-clear" id="chatClear">Clear chat</button></div>' +
    '<div class="chat-log" id="chatLog" aria-live="polite"></div>' +
    '<form class="chat-form" id="chatForm">' +
    '<label class="visually-hidden" for="chatInput">Type your question</label>' +
    '<input type="text" id="chatInput" placeholder="Ask me something..." autocomplete="off">' +
    '<button type="submit" class="btn btn-small">Send</button></form>';

  document.body.appendChild(panel);
  document.body.appendChild(fab);

  chatLog = document.getElementById("chatLog");
  chatInput = document.getElementById("chatInput");

  function setChatOpen(isOpen) {
    if (isOpen) closeFloatingPanels("chatPanel"); // only one pop-up at a time
    panel.classList.toggle("open", isOpen);
    fab.setAttribute("aria-expanded", isOpen);
    fab.setAttribute("aria-label", isOpen ? "Close chat assistant" : "Open chat assistant");
    if (isOpen) {
      chatInput.focus();
      chatLog.scrollTop = chatLog.scrollHeight;
    }
  }

  fab.addEventListener("click", function () {
    setChatOpen(!panel.classList.contains("open"));
  });

  panel.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setChatOpen(false);
      fab.focus();
    }
  });

  document.getElementById("chatForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const text = chatInput.value.trim();
    if (text === "") return;

    addChatMessage("user", text, true);
    chatInput.value = "";

    // A short delay makes it feel like the bot is "thinking"
    setTimeout(function () {
      addChatMessage("bot", getBotReply(text), true);
    }, 400);
  });

  document.getElementById("chatClear").addEventListener("click", function () {
    chatHistory = [];
    saveLocal(CHAT_KEY, chatHistory);
    chatLog.innerHTML = "";
    addChatMessage("bot", "Chat cleared. What would you like to know?", true);
  });

  // Show the saved conversation, or a first greeting
  if (chatHistory.length === 0) {
    addChatMessage("bot", "Hi! I'm the MEV helper. Ask me about expenses, budgets or the calculator.", true);
  } else {
    for (const item of chatHistory) {
      addChatMessage(item.sender, item.text, false);
    }
  }
}

document.addEventListener("DOMContentLoaded", buildChatWidget);
