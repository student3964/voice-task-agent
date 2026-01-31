def detect_intent(text):
    text = text.lower()

    if "email" in text or "mail" in text:
        return "SEND_EMAIL"
    elif "remind" in text or "reminder" in text:
        return "CREATE_REMINDER"
    elif "message" in text or "text" in text:
        return "SEND_MESSAGE"
    else:
        return "UNKNOWN"
