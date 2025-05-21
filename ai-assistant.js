/**
 * AI Assistant for mini-mart
 */

// AI Assistant DOM elements
const aiModal = document.getElementById('aiAssistantModal');
const openAiBtn = document.getElementById('openAiAssistant');
const closeAiBtn = document.getElementById('closeAiAssistant');
const aiMessages = document.getElementById('aiMessages');
const aiInputForm = document.getElementById('aiInputForm');
const aiInput = document.getElementById('aiInput');

// Open AI modal
openAiBtn.addEventListener('click', () => {
  aiModal.style.display = 'flex';
  setTimeout(() => aiInput.focus(), 200);
});

// Close AI modal
closeAiBtn.addEventListener('click', () => {
  aiModal.style.display = 'none';
});

// Close on outside click
window.addEventListener('mousedown', (e) => {
  if (aiModal.style.display === 'flex' && !aiModal.contains(e.target) && e.target !== openAiBtn) {
    aiModal.style.display = 'none';
  }
});

// Message rendering with slide-up animation
function appendMessage(text, sender = 'bot', html = null) {
  const msg = document.createElement('div');
  msg.className = `ai-message ${sender}`;
  if (html) {
    msg.innerHTML = html;
  } else {
    msg.textContent = text;
  }
  aiMessages.appendChild(msg);
  setTimeout(() => {
    msg.style.opacity = '1';
    msg.style.transform = 'translateY(0)';
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }, 10);
}

// Fuzzy search: Checks similarity between two strings (0 = no match, 1 = perfect match)
function similarity(s1, s2) {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length <= s2.length ? s1 : s2;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  return (longerLength - editDistance(longer, shorter)) / longerLength;
}

// Helper: Levenshtein Distance (calculates how many edits needed to match strings)
function editDistance(s1, s2) {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

// AI logic: Now supports fuzzy search for brands/categories
function aiReply(userMsg) {
  const msg = userMsg.trim().toLowerCase();
  if (!msg) return { text: "Please enter your question." };

  // Fallback: keyword-based answers (checked first)
  if (/hello|hi|hey/i.test(msg)) return { text: "Hello! How can I help you today?" };
  if (/order|tracking/i.test(msg)) return { text: "You can view your orders in your account section." };
  if (/refund|return/i.test(msg)) return { text: "For refunds, please check our Return Policy or contact support." };
  if (/contact|support/i.test(msg)) return { text: "You can contact us via the Contact link in the footer." };
  if (/coupon|discount/i.test(msg)) return { text: "Check our Coupons page for the latest offers!" };
  if (/sign in|login/i.test(msg)) return { text: "Click the Sign In button at the top right to log in." };
  if (/product|item/i.test(msg)) return { text: "Looking for something specific? Try searching above!" };
  if (/founder|owner/i.test(msg)) return { text: "SHAHID" };

  // Search for product (now includes fuzzy matching)
  const SIMILARITY_THRESHOLD = 0.7; // 70% match required
  const foundProducts = products.filter(p => {
    // Exact match (title, brand, category)
    const exactMatch = 
      (p.title && p.title.toLowerCase().includes(msg)) ||
      (p.brand && p.brand.toLowerCase().includes(msg)) ||
      (p.category && p.category.toLowerCase().includes(msg));

    // Fuzzy match (brand/category only)
    const fuzzyMatch = 
      (p.brand && similarity(msg, p.brand.toLowerCase()) >= SIMILARITY_THRESHOLD) ||
      (p.category && similarity(msg, p.category.toLowerCase()) >= SIMILARITY_THRESHOLD);

    return exactMatch || fuzzyMatch;
  });

  if (foundProducts.length > 0) {
    const html = foundProducts.slice(0, 3).map(p => `
      <div class="ai-product-card">
        <img src="${p.image}" alt="${p.title}" class="ai-product-img">
        <div class="ai-product-info">
          <strong>${p.title}</strong><br>
          <span>₹${Number(p.price).toFixed(2)}</span>
          <button class="ai-view-btn" data-id="${p.id}">View Details</button>
        </div>
      </div>
    `).join('');
    return { html: html || "I found some products matching your query." };
  }

  // Default fallback
  return { text: "I couldn't find any products. Try checking the spelling or ask about orders, refunds, etc." };
}

// Handle user input
aiInputForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const userMsg = aiInput.value;
  if (!userMsg.trim()) return;
  appendMessage(userMsg, 'user');
  aiInput.value = '';
  setTimeout(() => {
    const reply = aiReply(userMsg);
    if (reply.html) {
      appendMessage('', 'bot', reply.html);
      setupAiProductViewButtons();
    } else {
      appendMessage(reply.text, 'bot');
    }
  }, 500);
});

// Handle "View Details" button in AI product cards (closes modal)
function setupAiProductViewButtons() {
  document.querySelectorAll('.ai-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'));
      const product = products.find(p => p.id === id);
      if (product) {
        aiModal.style.display = 'none'; // Close AI modal
        showProductView(product);
      }
    });
  });
}

// Greet on first open
let aiGreeted = false;
openAiBtn.addEventListener('click', () => {
  if (!aiGreeted) {
    appendMessage("Hi! I'm Mini Mart AI Assistant. How can I help you today?", 'bot');
    aiGreeted = true;
  }
});