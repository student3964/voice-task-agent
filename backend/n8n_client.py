import requests

N8N_BASE_URL = "http://localhost:5678/webhook"

def call_n8n(endpoint, payload):
    url = f"{N8N_BASE_URL}/{endpoint}"
    response = requests.post(url, json=payload)
    return response.json()
