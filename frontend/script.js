/* script.js */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true; 
recognition.interimResults = true; 
recognition.lang = 'en-US';

let isRecording = false;
let finalTranscript = '';
let currentDraft = ''; 
let currentRecipient = { name: '', email: '' };
let isRefining = false; 

function resetAgentState() {
  document.getElementById("ai-suggestion").innerHTML = "";
  document.getElementById("output").innerHTML = '<p class="status">Waiting for command...</p>';
  finalTranscript = '';
  currentDraft = '';
  isRefining = false;
  const btn = document.getElementById("recordBtn");
  btn.innerHTML = "🎤 Start Recording";
  btn.style.background = "#4CAF50";
}

function normalizeEmail(text) {
  let cleaned = text.toLowerCase()
    .replace(/\bat the rate\b/gi, '@')
    .replace(/\bat\b/gi, '@')
    .replace(/\bdot\b/gi, '.')
    .replace(/\s+/g, '');
  const match = cleaned.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  return match ? match[0] : cleaned;
}

async function processCommand(transcript) {
  if (isRefining) {
    applyRefinement(transcript);
    return;
  }

  const output = document.getElementById("output");
  const emailRegex = /[a-zA-Z0-9._%+-]+\s*(?:at|@)\s*[a-zA-Z0-9.-]+\s*(?:dot|\.)\s*[a-zA-Z]{2,}/i;
  const emailMatch = transcript.match(emailRegex);
  
  let targetEmail = "";
  let targetName = "";

  if (emailMatch) {
    const rawEmail = normalizeEmail(emailMatch[0]);
    const extractedName = rawEmail.split('@')[0].split(/[0-9._-]/)[0];
    const capitalized = extractedName.charAt(0).toUpperCase() + extractedName.slice(1);

    if (window.ContactManager.hasNameConflict(capitalized, rawEmail)) {
      const choice = confirm(`Conflict: "${capitalized}" is already saved.\nOverwrite?`);
      if (choice) {
        window.ContactManager.addContact(capitalized, rawEmail);
        targetName = capitalized;
      } else {
        const newName = prompt(`Enter a name for ${rawEmail}:`, capitalized + " Work");
        if (newName) {
          window.ContactManager.addContact(newName, rawEmail);
          targetName = newName;
        } else { resetAgentState(); return; }
      }
    } else {
      if (!window.ContactManager.findByEmail(rawEmail)) {
        if (confirm(`Save ${rawEmail} as "${capitalized}"?`)) {
          window.ContactManager.addContact(capitalized, rawEmail);
        }
      }
      targetName = window.ContactManager.findByEmail(rawEmail)?.name || capitalized;
    }
    targetEmail = rawEmail;
  } else {
    const contacts = window.ContactManager.getAll();
    for (let name in contacts) {
      if (transcript.toLowerCase().includes(name.toLowerCase())) {
        targetName = name;
        targetEmail = contacts[name];
        break;
      }
    }
  }

  if (!targetEmail) {
    output.innerHTML = "❌ Recipient not found. Speak an email or a saved name.";
    return;
  }

  currentRecipient = { name: targetName, email: targetEmail };
  const topicMatch = transcript.match(/(?:about|saying|regarding)\s+(.+)$/i);
  const topic = topicMatch ? topicMatch[1] : "Follow up";
  
  updateContactsUI();
  generateAISuggestion(targetName, topic, transcript.toLowerCase());
}

function generateAISuggestion(name, topic, fullTranscript) {
  const isFormal = fullTranscript.includes("formal") || fullTranscript.includes("professional");
  const isCasual = fullTranscript.includes("casual") || fullTranscript.includes("friendly");
  const isUrgent = fullTranscript.includes("urgent") || fullTranscript.includes("asap");
  const isApology = fullTranscript.includes("apology") || fullTranscript.includes("sorry");
  const isThanks = fullTranscript.includes("thank") || fullTranscript.includes("appreciation");

  let subject = `Subject: Regarding ${topic.split(',')[0].substring(0, 30)}`;
  if (isApology) subject = `Subject: Sincere Apology`;
  if (isThanks) subject = `Subject: Thank You`;
  if (isUrgent) subject = `Subject: URGENT: Action Required`;

  let bodyContent = topic;
  if (topic.includes(",") || topic.includes(" and ")) {
    const points = topic.split(/,| and /);
    bodyContent = "\n" + points.map(p => `• ${p.trim()}`).join("\n");
  }

  let message = "";
  if (isApology) {
    message = `Hi ${name},\n\nI sincerely apologize for ${bodyContent}. I understand the inconvenience caused and will ensure this doesn’t happen again.\n\nBest regards.`;
  } else if (isThanks) {
    message = `Hi ${name},\n\nI wanted to send a quick note of appreciation for ${bodyContent}. It is greatly appreciated!\n\nBest,`;
  } else if (isFormal) {
    message = `Dear ${name},\n\nI hope this email finds you well. I am writing to discuss ${bodyContent}.\n\nPlease let me know your thoughts at your earliest convenience.\n\nBest regards.`;
  } else if (isCasual) {
    message = `Hi ${name},\n\nJust checking in about ${bodyContent}. Let me know what you think! 🙂\n\nCheers.`;
  } else {
    message = `Hi ${name},\n\nRegarding ${bodyContent}, I wanted to say hii.\n\nLet me know how you'd like to proceed.`;
  }

  currentDraft = `${subject}\n\n${message}`;
  displayDraft();
}

function displayDraft() {
  const suggestionContainer = document.getElementById("ai-suggestion");
  const lines = currentDraft.split('\n');
  const subjectLine = lines[0];
  const bodyText = lines.slice(2).join('\n');

  suggestionContainer.innerHTML = `
    <div style="background:#e3f2fd; padding:15px; border-radius:8px; border-left:5px solid #2196f3; margin-bottom:20px;">
      <strong style="color:#1565c0;">🤖 AI Suggested Draft:</strong>
      <div style="background:white; border:1px solid #ccc; padding:10px; margin:10px 0; font-size:14px; white-space: pre-wrap;"><b>${subjectLine}</b>\n\n${bodyText}</div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <button onclick="sendEmail()" style="grid-column: span 2;">✅ Send This Email</button>
        <button onclick="startVoiceRefine()" style="background:#ff9800;">🎤 Refine by Voice</button>
        <button onclick="startTextRefine()" style="background:#03a9f4;">⌨️ Refine by Text</button>
        <button onclick="resetAgentState()" style="background:#757575; grid-column: span 2;">❌ Discard</button>
      </div>
    </div>
  `;
}

function startTextRefine() {
  const feedback = prompt("How should I change the draft?");
  if (feedback) applyRefinement(feedback);
}

function startVoiceRefine() {
  isRefining = true;
  finalTranscript = '';
  toggleRecording();
}

// Updated applyRefinement: Replaces body content with the spoken transcript
function applyRefinement(feedback) {
  const subjectLine = currentDraft.split('\n')[0];
  currentDraft = `${subjectLine}\n\nHi ${currentRecipient.name},\n\n${feedback}\n\nBest regards.`;
  isRefining = false;
  displayDraft();
}

async function sendEmail() {
  if (!confirm(`Send to ${currentRecipient.email}?`)) return;
  try {
    const res = await fetch("https://vijvaidehi.app.n8n.cloud/webhook/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: currentRecipient.email, body: currentDraft })
    });
    if (res.ok) { alert("✅ Sent!"); resetAgentState(); }
  } catch (e) { alert("❌ Webhook failure."); resetAgentState(); }
}

function toggleRecording() {
  const btn = document.getElementById("recordBtn");
  if (!isRecording) {
    recognition.start();
    btn.innerHTML = "🛑 Stop & Process";
    btn.style.background = "#f44336";
    isRecording = true;
  } else {
    recognition.stop();
    btn.innerHTML = "🎤 Start Recording";
    btn.style.background = "#4CAF50";
    isRecording = false;
  }
}

recognition.onresult = (event) => {
  let interimTranscript = '';
  for (let i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
    else interimTranscript += event.results[i][0].transcript;
  }
  document.getElementById("output").innerHTML = `<span style="color:gray;">${finalTranscript}</span> <span style="color:blue;">${interimTranscript}</span>`;
};

recognition.onend = () => {
  if (finalTranscript && !isRecording) processCommand(finalTranscript);
};

// New function for manual entry
function manualAddContact() {
  const name = prompt("Enter contact name:");
  if (!name) return;
  const email = prompt(`Enter email for ${name}:`);
  if (!email) return;
  const normalizedEmail = normalizeEmail(email);
  window.ContactManager.addContact(name, normalizedEmail);
  updateContactsUI();
}

// Updated UI function to include manual entry button
function updateContactsUI() {
  const container = document.getElementById('contacts');
  const contacts = window.ContactManager.getAll();
  const listHtml = Object.keys(contacts).map(name => `
    <div style="padding:10px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; background:white; margin-bottom:5px;">
      <span><strong>${name}</strong><br><small>${contacts[name]}</small></span>
      <button onclick="deleteContact('${name}')" style="width:auto; padding:5px; background:red; margin:0;">Delete</button>
    </div>
  `).join('');

  container.innerHTML = `
    <button onclick="manualAddContact()" style="background:#2196f3; margin-bottom:15px;">+ Add Contact Manually</button>
    ${listHtml || "No contacts."}
  `;
}

function deleteContact(name) {
  window.ContactManager.removeContact(name);
  updateContactsUI();
}

window.addEventListener('load', () => { window.ContactManager.init(); updateContactsUI(); });