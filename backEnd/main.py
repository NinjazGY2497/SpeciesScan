import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import base64
import json

from schemas import AnalysisResponse

load_dotenv()
GROQ_KEY = os.getenv("GROQ_KEY")
if not GROQ_KEY:
    print("**main.py** - ERROR - No Groq Key Found")
    raise Exception

client = Groq(api_key=GROQ_KEY)

app = Flask(__name__)
CORS(app)

def imgToBase64URL(img):
    imgData = img.read()
    imgBase64 = base64.b64encode(imgData).decode("utf-8")
    imgURL = f"data:image/png;base64,{imgBase64}"
    return imgURL

def requestGroq(img):
    try:
        SYSTEM_PROMPT = """
        You are a biologist/geneticist. For each image you get, identify the organisms in the photo, and for each organism identify the phenotypes. For each phenotype, also identify the genotype and the rest of the required information to fill the required schema.
        In total over all the organisms, give 4-5 traits in total.
        
        CRITICAL TRAIT SELECTION RULES: 
        - You MUST ONLY select simple Mendelian traits.
        - If the organisms' traits don't collectively have 4-5 easily viewable Mendelian traits, it is fine to just output 2 or 3. Do not force a polygenic trait or complex non-Mendelian trait just to reach the quota.
        
        Genotype Rules:
        - Recessive traits must be homozygous (e.g., 'aa').
        - If a trait has complete dominance but the second allele is visually unknown, use an underscore (ex: 'A_').
        - For incomplete dominance or codominance, use the heterozygous format for the "blended" phenotype (ex:, 'Aa') and homozygous formats for ('AA' or 'aa').
        """

        USER_PROMPT = """Identify the organisms in this image and extract their genetic data. Populate the ResponseSchema correctly, and include 4-5 traits in total across all the organisms."""

        chatCompletion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": [
                    {"type": "text", "text": USER_PROMPT},
                    {"type": "image_url", "image_url": {"url": imgToBase64URL(img)}},
                ]}
            ],
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "AnalysisResponse",
                    "strict": True,
                    "schema": AnalysisResponse.model_json_schema()
                }
            }
        )

        inputTokens = chatCompletion.usage.prompt_tokens
        outputTokens = chatCompletion.usage.completion_tokens
        totalTokens = chatCompletion.usage.total_tokens
        response = json.loads(chatCompletion.choices[0].message.content)
        print(f"**main.py** - INFO - AI Response: {response}\n"
              f"Input Tokens: {inputTokens} | Output Tokens: {outputTokens} | Total Tokens: {totalTokens}")

        return response

    except Exception as e:
        print(f"**main.py** - ERROR - Failed to Request Groq: {e}")
        raise Exception

@app.route("/ai-response", methods=["POST"])
def getAIResponse():
    try:
        incomingData = request.get_json()
        img = incomingData.get("img")
        print(f"**main.py** - INFO - Incoming Data: {incomingData}")
    except:
        print(f"**main.py** - ERROR - Failed to parse incoming JSON: {promptData}")
        raise

    response = requestGroq(img)
    print(f"**main.py** - INFO - Groq Response: {response}")

    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=2497)