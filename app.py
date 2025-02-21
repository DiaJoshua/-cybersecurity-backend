from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import torch
import json

app = Flask(__name__)
CORS(app, origins="http://localhost:5173")

# Load fine-tuned GPT-2 model and tokenizer
model_name = "./Chatbot/fine_tuned_gpt2_2"
model = GPT2LMHeadModel.from_pretrained(model_name)
tokenizer = GPT2Tokenizer.from_pretrained(model_name)
model.eval()

# Load the rules-based dataset
with open("./Chatbot/chatbot_dataset.json", "r", encoding="utf-8") as file:
    rules_based_data = json.load(file)

def get_rules_based_response(question):
    """Check if a predefined response exists for the given question."""
    lower_question = question.lower().strip()
    for key in rules_based_data.keys():
        if lower_question in key.lower():
            return rules_based_data[key]
    return None

def generate_answer(question, model, tokenizer, max_length=512):
    """Generate an AI response if no rules-based match is found."""
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

    # **Step 1: Check rules-based responses**
    rules_response = get_rules_based_response(user_message)
    if rules_response:
        return jsonify({"response": rules_response})

    # **Step 2: If no match, use AI model**
    ai_response = generate_answer(user_message, model, tokenizer)
    return jsonify({"response": ai_response})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3000)
