import time
from dotenv import load_dotenv
from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import json
from chatResponse import generate_response
from hintBackend import retrieveHint
from handleExit import end_subproblem_timer_logic

load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)
# More specific CORS configuration
CORS(app, resources={
    r"/api/*": {
        "origins": "*", # Or specify your frontend URL for better security
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

@app.route('/api/ai', methods=['POST'])
def ai_service():
    payload = request.json
    return Response(generate_response(payload), mimetype='text/event-stream')

# This method must return a JSON object with a 'hint' key
@app.route('/api/hint', methods=['POST'])
def hint_service():
    payload = request.json
    return retrieveHint(payload)

@app.route('/api/track/end-subproblem', methods=['POST'])
def end_subproblem_route():
    """
    This route receives the beacon request and passes it to the logic handler.
    """
    print("Received request to end subproblem timer")
    data = request.get_json()
    response_data, status_code = end_subproblem_timer_logic(data)
    return jsonify(response_data), status_code

if __name__ == '__main__':
    app.run(port=5001, debug=True)