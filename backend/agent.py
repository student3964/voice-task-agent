from n8n_client import call_n8n

def agent_decide(intent, text):
    if intent == "SEND_EMAIL":
        return call_n8n("send-email", {
            "to": "test@example.com",
            "body": text
        })

    elif intent == "CREATE_REMINDER":
        return call_n8n("create-reminder", {
            "task": text
        })

    elif intent == "SEND_MESSAGE":
        return call_n8n("send-message", {
            "message": text
        })

    else:
        return {"status": "Unknown command"}
