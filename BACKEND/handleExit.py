import os
from flask import Flask, request, jsonify
from supabase import create_client, Client
from datetime import datetime, timezone

url: str = os.environ.get("SUPABASE_PUBLIC_URL")
key: str = os.environ.get("SERVICE_ROLE_KEY") 
supabase: Client = create_client(url, key)

def end_subproblem_timer_logic(data):
    """
    Handles the business logic for ending a subproblem timer session.
    Takes request data as a dictionary.
    Returns a tuple containing a response dictionary and an HTTP status code.
    """
    try:
        session_id = data.get('session_id')

        if not session_id:
            return ({"error": "session_id is required"}, 400)

        # 1. Fetch the session to get its start_time
        response = supabase.table('subproblem_time_logs').select('start_time').eq('id', session_id).single().execute()
        
        if not response.data:
             return ({"error": "Session not found"}, 404)

        # 2. Calculate duration
        start_time_str = response.data['start_time']
        start_time = datetime.fromisoformat(start_time_str)
        end_time = datetime.now(timezone.utc)

        print(f"Start time: {start_time}, End time: {end_time}")

        duration = round((end_time - start_time).total_seconds())

        # 3. Update the record with end_time and duration
        supabase.table('subproblem_time_logs').update({
            'end_time': end_time.isoformat(),
            'duration_seconds': duration
        }).eq('id', session_id).execute()

        return ({"success": True}, 200)

    except Exception as e:
        print(f"Error ending subproblem timer: {e}")
        return ({"error": "Internal Server Error"}, 500)