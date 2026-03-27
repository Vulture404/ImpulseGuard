import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-2.5-flash")

try:
    response = model.generate_content("Say hello")
    print("SUCCESS: ", response.text)
except Exception as e:
    print(f"ERROR: {type(e).__name__} - {e}")
