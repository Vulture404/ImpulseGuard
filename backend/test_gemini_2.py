import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print(f"Loaded key: {api_key}")

genai.configure(api_key=api_key)

try:
    print([m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods])
except Exception as e:
    print("List models error:", e)

model = genai.GenerativeModel("gemini-pro")

try:
    response = model.generate_content("Say hello")
    print("SUCCESS: ", response.text)
except Exception as e:
    print(f"ERROR: {type(e).__name__} - {e}")
