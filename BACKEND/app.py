import time
from flask import Flask, request, Response
from flask_cors import CORS
import json
from chatResponse import generate_response
from hintBackend import retrieveHint

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

@app.route('/api/ai', methods=['POST'])
def ai_service():
    payload = request.json
    return Response(generate_response(payload), mimetype='text/event-stream')

# This method must return a JSON object with a 'hint' key
@app.route('/api/hint', methods=['POST'])
def hint_service():
    payload = request.json
    return retrieveHint(payload)

if __name__ == '__main__':
    app.run(port=5001, debug=True)