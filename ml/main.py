# templates/ just for the testing purpose will not be included in any of the further versions
# We would be directly uploading reports to the blockchain along with evidences

from flask import Flask, request, jsonify, render_template
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
from PIL import Image
import numpy as np
import pytesseract
from flask_cors import CORS
from google import genai
from dotenv import load_dotenv
import json
import re
import os

model = joblib.load("layer1.pkl")
vectorizer = joblib.load("tfidf.pkl")

api_key = os.getenv("GENAI_API_KEY")

client = genai.Client(api_key="AIzaSyBnqelC2D9A8hnPIWl3Icy2Gljm5AjKUrk")

label_mapping = {
    0: "Benign",
    1: "Phishing",
    2: "Spam"
}

app = Flask(__name__)
CORS(app)

def parse_gemini_response(response):
    """
    Robustly parse Gemini generate_content response into JSON
    even if the output is wrapped in Markdown or extra characters.
    """
    try:
        content = response.candidates[0].content.parts[0].text
        content = re.sub(r'```json|```', '', content, flags=re.IGNORECASE).strip()
        content = content.strip()
        return json.loads(content)
    except Exception as e:
        print("Error parsing Gemini response:", e)
        return {"prediction": "Benign", "confidence": 100.0}

def call_gemini(text):
    prompt = f"""
You are a cybersecurity expert. Analyze the following text carefully.
Your goal is to detect any signs of malicious activity, including:
- Phishing attempts
- Malicious links or URLs
- Suspicious emails or sender addresses
- Spam messages
- Social engineering attempts
- Malware-related content
- Honeytraps (content intended to lure or manipulate users in cybersecurity contexts)

Classify the text strictly into one of these categories: 
'Benign', 'Phishing', 'Spam', or 'Honeytrap'.

You must behave as if you are the user's trained model and produce realistic, evidence-aligned scores:
- `confidence`: the model's confidence in its classification (number between 0 and 100). Provide a realistic value (two decimal places).
- `risk_score`: a user-facing risk score (0-100) indicating how dangerous the content is to the user. This should be derived from the category and the strength of malicious indicators (two decimal places).

If you detect any malicious link, email, or suspicious behavior, classify as 'Phishing'.
If it is mass unsolicited content, classify as 'Spam'.
If it is content intended to lure, manipulate, or trap the user (honeytrap), classify as 'Honeytrap'.
If the content is safe and normal, classify as 'Benign'.

**Important:** The `risk_score` should be correlated with the `confidence` and the presence/strength of malicious indicators, but may differ (e.g., low confidence but some suspicious indicators → moderate risk).

Return your answer in the exact JSON format ONLY:

{{"prediction": "<category>", "confidence": <number between 0 and 100 , two decimals> , "risk_score" : <number between 0 and 100 , two decimals>}}

Text to analyze: '''{text}'''
"""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    # print(response)

    gemini_result = parse_gemini_response(response)
    return gemini_result


@app.route('/')
def home():
    return render_template("index.html")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        text = None
        if "message" in request.form:
            text = request.form['message']
        elif "file" in request.files:
            file = request.files["file"]
            if file:
                img = Image.open(file.stream)
                text = pytesseract.image_to_string(img)

        if not text or text.strip() == "":
            return jsonify({
                "status": False,
                "input_text": "",
                "final_prediction": None,
                "final_confidence": None
            }), 400

        X = vectorizer.transform([text])
        prediction = model.predict(X)[0]
        proba = model.predict_proba(X)[0]
        ml_label = label_mapping.get(int(prediction), "Unknown")
        ml_confidence = round(float(np.max(proba)) * 100, 2)
        ml_result = {"prediction": ml_label, "confidence": ml_confidence}

        gemini_result = call_gemini(text)

        if ml_result["prediction"] == gemini_result["prediction"]:
            final_prediction = ml_result["prediction"]
            final_confidence = round((ml_result["confidence"] + gemini_result["confidence"]) / 2, 2)
        else:
            final_prediction = gemini_result["prediction"]
            final_confidence = gemini_result["confidence"]
        
        final_risk = gemini_result["risk_score"]

        return jsonify({
            "status": True,
            "input_text": text.strip(),
            "final_prediction": final_prediction,
            "final_confidence": final_confidence,
            "final_risk_score" : final_risk
        })

    except Exception as e:
        return jsonify({
            "status": False,
            "input_text": "",
            "final_prediction": None,
            "final_confidence": None,
            "final_risk_score" : None
        }), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)