import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_login():
    url = "http://127.0.0.1:8000/auth/login"
    
    # Use environment variables instead of hardcoded values
    email = os.getenv("ADMIN_EMAIL", "admin@straysafe.com")
    password = os.getenv("ADMIN_PASSWORD", "password123")
    
    payload = {
        "email": email,
        "password": password
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        print(f"Attempting to login to {url} with email: {email}...")
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("Login successful!")
        else:
            print("Login failed.")
            
    except Exception as e:
        print(f"Error: {e}. Make sure the uvicorn server is running.")

if __name__ == "__main__":
    test_login()
