import time
from flask import Flask, request, Response
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

def generate_response(payload):
    print("Received payload:", payload.get('chatHistory'))
    """Generator function to stream response chunks."""
    action = payload.get('action', 'default')
    response_text = ""

    if action == 'initialize':
        response_text = f"Let's begin. {payload.get('problem', '')}\n\n{payload.get('subproblem', '')}"

    elif action == 'validate':
        # In a real scenario, you might stream the reasoning before the final verdict.
        # For this simulation, we'll stream the message.
        is_correct = len(payload.get('userResponse', '')) > 10
        message = "Great job! That's correct. Let's move to the next problem." if is_correct \
                  else "That's not quite right. Let me give you a hint: Think about the problem from a different angle."
        
        # We need to send the isCorrect status along with the message.
        # We'll send it as the first chunk, as a JSON object.
        initial_data = json.dumps({"isCorrect": is_correct})
        yield f"data: {initial_data}\n\n"
        time.sleep(0.1) # simulate network delay
        response_text = message

    elif action == 'next':
        response_text = f"Now let's tackle Problem {payload.get('problem', '')}:\n\n{payload.get('subproblem', '')}"
    else:
        response_text = "I'm here to help you learn!"

    # Stream the text content word by word
    for word in response_text.split():
        yield f"data: {json.dumps({'chunk': word + ' '})}\n\n"
        time.sleep(0.05)

@app.route('/api/ai', methods=['POST'])
def ai_service():
    payload = request.json
    return Response(generate_response(payload), mimetype='text/event-stream')

if __name__ == '__main__':
    app.run(port=5001, debug=True)