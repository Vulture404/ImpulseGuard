# ⏳ TimeVault (ImpulseGuard)

> A brutalist, AI-powered behavioral finance deterrent designed to mathematically and psychologically halt impulse buying.

## 📖 Overview
TimeVault structurally alters your relationship with money by translating the price of an item directly into the **hours of your life** required to earn it. When an eCommerce link is pasted into the application, TimeVault intercepts out the purchase intent, calculates the actual time-cost based on your disposable income, and employs a **Dynamic AI Thresholding Gate** (powered by Google Gemini) to categorize the purchase as a Necessity, Investment, or hazardous Impulse. 

If deemed dangerous, the system locks the checkout sequence behind an aggressive UI and requires manual, intentional confirmation to proceed—saving users from immediate financial ruin.

---

## 🛠️ Technology Stack & Frameworks

We built a highly decoupled, modern architecture to separate the rapid UI rendering from the computationally intensive parsing and AI evaluation. 

### Frontend (Client-Side)
- **Framework**: React.js / Vite (for hyper-fast local dev and optimized hot-module replacement).
- **Styling**: Tailwind CSS (used exclusively to construct the stark, brutalist, and highly reactive dark-mode UI).
- **Network Protocol**: Axios (for asynchronous, non-blocking HTTP requests to the backend).
- **Icons & Assets**: Lucide-React (supplying scalable vector imagery for the UI overlay).

### Backend (Server-Side)
- **Framework**: FastAPI (chosen for its incredibly high performance and asynchronous request handling).
- **Web Server**: Uvicorn (ASGI server seamlessly handling concurrent evaluation and scraping threads).
- **Language**: Python 3.10+
- **Environment Management**: `python-dotenv` (to securely isolate API Keys).

### Data & AI Integration
- **Scraping Engine**: A combination of `requests` (with simulated Chrome 122 Header handshakes to bypass bot-checks) and `BeautifulSoup4`. It recursively hunts DOM trees for `og:price:amount` headers, embedded `<title>` tags, and complex invisible `application/ld+json` arrays to dynamically rip pricing data from eCommerce targets.
- **Artificial Intelligence**: `google-generativeai` SDK leveraging the **Gemini 1.5 Flash** model. It processes the intercepted product data against strict internal prompts and returns mathematically grounded risk assessments exclusively in JSON formats.

---

## 🧠 Code Explanation & Architecture Flow

### 1. The React State Machine (`App.jsx`)
The frontend operates on a strict multi-stage lifecycle Hook (`stage`):
- **Stage 0 (Input)**: User pastes standard URL.
- **Stage 1 (Intercept & Mutate)**: Data returned by the Python scraper is placed into a secure form where the user can verify or manually overwrite obscured pricing.
- **Stage 2 (Dynamic AI Bifurcation)**:
  Once the "Reality Check" is submitted, the system asynchronously pings the `/evaluate` backend. Upon return, the logic calculates the exact metric: `totalHours = (price / hourlyLifeValue)`.
  * **Path A (The Safe Gate)**: If `totalHours < dynamic AI threshold` (e.g., Medicine limit of 999 hours). The UI shifts Emerald green, removes friction, and actively encourages the checkout.
  * **Path B (The Red Zone)**: If `totalHours` exceeds the AI's limit (e.g., Designer Sneakers limit of 12 hours). The React virtual DOM replaces the calm overlay with a massive, pulsing Crimson UI reading "DAYS AND HOURS". The checkout is completely disabled until the exact string `CONFIRM` is typed into an un-copyable input box.

### 2. The Chrono-Risk Metric Engine (`App.jsx`)
A global React `useEffect` Hook actively monitors the host machine's timezone every 60 seconds. A pure JavaScript function establishes a behavioral matrix overlaying the screen at all times:
- **Low Risk (6 AM - 8 PM)**: UI tracks an Emerald glowing orb.
- **Elevated Risk (8 PM - 11 PM)**: UI tracks an Amber glowing orb.
- **High Risk (11 PM - 6 AM)**: The late-night impulse zone. The orb transforms into an `animate-pulse` Crimson dot, actively warning the user that their brain's cognitive defense mechanisms are compromised.

### 3. The Backend Evaluator (`main.py`)
Utilizing FastAPI's `@app.post("/evaluate")` decorated endpoints, the server injects the scraped product data into a specialized context prompt utilizing Gemini SDK's `generation_config(response_mime_type="application/json")`. 

This forces Gemini to guarantee a strict 3-part dictionary format containing:
1. `category` 
2. `dynamic_threshold_hours` 
3. `ai_reasoning`

To ensure robust persistence in production, Python `Exception` handlers form a steel trap at the bottom of the stack. If the Google APIs experience an outage, return a 403 Forbidden, or decode improperly, the Exception Handler forcefully injects a `0-hour` threshold payload back to React—deliberately isolating Path A and routing *all* items safely to the protective Path B gate.
