## 📧 Agentic Email Assistant (VoiceToText)

An AI-powered Agentic Email Assistant that enables users to compose, refine, and send professional emails using simple voice commands — with intelligent reasoning and human-in-the-loop confirmation.

## 🚀 Overview

Writing clear, professional, and context-appropriate emails can be time-consuming and mentally exhausting. Users often struggle with:

- Choosing the correct tone (formal, apology, urgent, casual)

- Structuring content properly

- Avoiding grammar and clarity mistakes

- Speaking full email addresses in voice-based systems

- Sending emails without proper review

The Agentic Email Assistant solves this using Large Language Models (LLMs), Speech Recognition, and Workflow Automation — while ensuring the user always stays in control.

## 🧠 Key Idea: Agentic AI with Human-in-the-Loop

This system is not just a text generator. It behaves like an intelligent agent with:

- Perception → Understands voice/text input

- Reasoning → Detects intent, tone, and context

- Action → Generates refined email drafts

- Confirmation → Sends email only after user approval

## 🏗️ System Architecture
1️⃣ Perception Layer (Input)

Accepts:

🎤 Voice Commands (Web Speech API / Whisper)

⌨️ Text Input

Example Command:

"Send a formal apology email to Yasha for being late"


Performs:

- Speech-to-text conversion

- Intent detection

- Tone classification

2️⃣ Decision Layer (Agentic Reasoning)

The system identifies:

- Email intent

- Tone (formal, apology, professional, urgent, casual)

- Context (manager, peer, personal)

Then it provides smart options:

- Refine with AI

- Send as-is

- Refine manually

- Cancel

This ensures controlled autonomy instead of blind automation.

3️⃣ Action Layer (Execution)

Auto-generates:

- Subject line

- Structured email body

Uses:

- OpenAI LLM API for refinement and elaboration

Sends email via:

- n8n Workflow Automation

🔒 Emails are never sent without explicit confirmation.

## ✨ Supporting Features

📇 Persistent Contact Book (name → email mapping)

🎙️ No need to speak email addresses

🧠 Optional AI elaboration for professional contexts

🛡️ Safe execution with confirmation before sending

📬 Automated email delivery via n8n

## 🛠️ Tech Stack

Frontend: HTML, CSS, JavaScript

Speech Recognition: Web Speech API / Whisper

AI Model: OpenAI GPT API

Automation: n8n

Storage: Local Storage

## 🔄 System Flow

User gives voice/text command

System detects intent & tone

Draft email is generated

User chooses refinement option

Final confirmation

Email sent via automation
