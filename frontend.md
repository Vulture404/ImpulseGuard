# TimeVault - Frontend Developer Blueprint

This document outlines all strict state variables, core formulas, API interfaces, and logic pathing required to build the TimeVault React frontend.

---

## 1. Core State Management (`useState`)

You must maintain the following variables to manage the flow of the application:

### Financial & Mathematical State
* `income` (number) - User's monthly net income.
* `expenses` (number) - User's fixed monthly costs.
* `hourlyLifeValue` (derived float) - Formula: `Math.max(0, income - expenses) / 240`. Fallback to `1` if 0 to prevent division by zero.

### eCommerce Data Mapping
* `url` (string) - The raw URL of the item the user wants to buy.
* `itemTitle` (string) - The intercepted product name (editable).
* `itemPrice` (number/string) - The intercepted product cost (editable).

### Network & Application Flow
* `stage` (integer: 0, 1, or 2) - Controls which screen renders (see Section 3).
* `loading` (boolean) - Disables buttons/inputs during Axios calls.
* `scrapeFailed` (boolean) - Toggles a warning if the backend failed to fetch price automatically.
* `aiError` (string) - Stores any failure messages from the Gemini AI.
* `result` (object) - The structured response payload from the AI evaluation.
* `confirmText` (string) - Tracks the friction-gate input box.

---

## 2. The Chrono-Risk HUD Module
This is a fixed UI overlay evaluating psychological vulnerability based on local machine time.

**Requires `useEffect` to poll every 60,000ms:**
```javascript
const hour = new Date().getHours();
// Matrix Logic:
if (hour >= 6 && hour < 20) return 'low';       // Green Theme
if (hour >= 20 && hour < 23) return 'medium';   // Amber Theme
return 'high';                                  // Red Theme (Pulsing)
```

---

## 3. The 3-Stage Application Lifecycle

### Stage 0: The Hook
* **UI**: Massive input field for `url`.
* **Action**: Submitting triggers POST to `/scrape`.
* **Success**: Update `itemTitle` and `itemPrice`, set `stage = 1`.

### Stage 1: The Verification Chamber
* **UI**: Two text inputs allowing the user to manually correct the `itemTitle` or `itemPrice`.
* **Action**: User hits "Get Reality Check". Fire POST to `/evaluate`.
* **Error Handling**: If `category === "Error"`, do NOT progress. Update `aiError` state and display it inline.
* **Success**: If a valid response is received, map data to `result`, calculate the `totalHours` of life the item costs, and set `stage = 2`.

### Stage 2: The Bifurcated Logic Gate
**Core Mathematics required:**
```javascript
const totalHours = numericPrice / hourlyLifeValue;
const daysOfLife = Math.floor(totalHours / 24);
const hoursOfLife = Math.floor(totalHours % 24);
```

You must fork the UI rendering based on the AI's provided mathematical threshold: `if (totalHours < result.dynamic_threshold_hours)`

#### Path A: The Green Gate (Necessity/Safe)
If the price is **BELOW** the AI's threshold:
* Render a calm, Emerald/Green UI.
* Display the AI's category (e.g., Necessity) and strictly output its `ai_reasoning` text.
* Provide an immediate "Proceed to Checkout" button that runs `window.location.href = url`.

#### Path B: The Red Gate (Impulse/Dangerous)
If the price is **ABOVE** the AI's threshold:
* Render a brutalist, massive Crimson/Red UI.
* Hit them with the exact math: `"THIS WILL COST YOU {daysOfLife} DAYS AND {hoursOfLife} HOURS OF YOUR LIFE."`
* Inject the AI's harsh `ai_reasoning` roast.
* **The Friction Wall**: Render an input box. The "GO TO CHECKOUT" button MUST remain completely disabled unless `confirmText.trim().toUpperCase() === 'CONFIRM'`.

---

## 4. Backend API Integration Specifications

### Endpoint A: POST `/scrape`
* **URL Form**: `http://127.0.0.1:8000/scrape`
* **Request Payload**: `{ "url": "https://store.url/product" }`
* **Expected Response Header**: application/json
* **Expected Response Body**: 
```json
{
  "title": "Designer Shoes",
  "price": 499.99,
  "success": true
}
```

### Endpoint B: POST `/evaluate`
* **URL Form**: `http://127.0.0.1:8000/evaluate`
* **Request Payload**: `{ "title": "Designer Shoes", "price": 499.99 }`
* **Expected Response Header**: application/json
* **Expected Response Body**: 
```json
{
  "category": "Lifestyle/Impulse",
  "dynamic_threshold_hours": 12,
  "ai_reasoning": "These are purely aesthetic and completely unnecessary."
}
```
