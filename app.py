from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import torch
import json
import os

# Configure Flask to serve static files from the "Chatbot" folder (inside Server)
app = Flask(__name__, static_folder="Chatbot", static_url_path="/Chatbot")
CORS(app, origins="http://localhost:5173")

# Load your fine-tuned GPT-2 model and tokenizer
model_name = "./Chatbot/fine_tuned_gpt2_2"
model = GPT2LMHeadModel.from_pretrained(model_name)
tokenizer = GPT2Tokenizer.from_pretrained(model_name)
model.eval()

# Load the rules-based dataset using a relative path from app.py (which is in Server)
with open(os.path.join("Chatbot", "chatbot_dataset.json"), "r", encoding="utf-8") as file:
    rules_based_data = json.load(file)

# Set a maximum number of words allowed in the input question
MAX_INPUT_WORDS = 75

def get_rules_based_response(question):
    lower_question = question.lower().strip()
    return rules_based_data.get(lower_question, None)


def generate_answer(question, model, tokenizer, max_length=512):
    # Limit the question to MAX_INPUT_WORDS words
    words = question.split()
    if len(words) > MAX_INPUT_WORDS:
        question = " ".join(words[:MAX_INPUT_WORDS])
    
    input_text = f"Question: {question} Answer:"
    input_ids = tokenizer.encode(input_text, return_tensors='pt')
    output = model.generate(
        input_ids,
        max_length=max_length,
        num_return_sequences=1,
        early_stopping=True,
        top_p=0.9,
        temperature=0.1,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id
    )
    answer = tokenizer.decode(output[0], skip_special_tokens=True)
    return answer.split("Answer:")[-1].strip()

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get("message")
    if not user_message:
        return jsonify({"response": "Sorry, I didn't catch that. Please try again."})
    
    # Check for a rules-based response first
    rules_response = get_rules_based_response(user_message)
    if rules_response:
        return jsonify({"response": rules_response})
    
    # Generate an AI response using the (possibly truncated) user_message
    ai_response = generate_answer(user_message, model, tokenizer)
    
    # Ensure the response is valid
    if ai_response and len(ai_response) > 5:
        return jsonify({"response": ai_response})
    
    # Default fallback response if both fail
    return jsonify({"response": "I'm sorry, but I couldn't find an answer to your question."})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3000)
