from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta
import json

# MongoDB Configuration
MONGO_URI = "mongodb+srv://iotgroup6:iotgroup6@iotcluster-v0.ykiu0.mongodb.net/?retryWrites=true&w=majority&appName=IOTCluster-V0"
client = MongoClient(MONGO_URI)
db = client["iotdata"]  # Database name
collection = db["mqttMessages"]  # Collection name

# Flask App Configuration
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

@app.route("/save-mqtt-data", methods=["POST"])
def save_mqtt_data():
    """
    Endpoint to save MQTT data into MongoDB.
    Expects JSON payload: { "topic": <string>, "payload": <string>, "timestamp": <string> }
    """
    try:
        data = request.json
        if not data or "topic" not in data or "payload" not in data:
            return jsonify({"error": "Invalid request"}), 400

        # Add timestamp if not provided
        if "timestamp" not in data:
            data["timestamp"] = datetime.utcnow().isoformat()

        # Save to MongoDB
        collection.insert_one(data)
        return jsonify({"message": "Data saved successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
@app.route("/fetch-mqtt-data", methods=["GET"])
def fetch_mqtt_data():
    """
    Endpoint to fetch all MQTT data from MongoDB.
    """
    try:
        # Retrieve all documents from the 'mqttMessages' collection
        data = list(collection.find({}, {"_id": 0}))  # Exclude the default `_id` field
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/fetch-motion-data", methods=["GET"])
def fetch_motion_data():
    """
    Endpoint to fetch motion detection data for the last 7 days.
    """
    try:
        # Calculate the start and end of the last 7 days
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)

        # Initialize an empty list to hold the data for the last 7 days
        motion_data = []

        # Query MongoDB for motion detection data for the last 7 days
        query = {
            "topic": "home/security/door/motion",
            "timestamp": {
                "$gte": start_date,
                "$lte": end_date
            }
        }

        # Fetch the data from the collection
        data = list(collection.find(query, {"_id": 0, "timestamp": 1, "payload": 1}))

        # Create a dictionary to store motion data for each of the last 7 days
        for i in range(7):
            day_data = [0] * 24  # 24 hours in a day (0 = no motion, 1 = motion detected)
            day_start = start_date + timedelta(days=i)
            day_end = day_start + timedelta(days=1)

            # Process each document
            for entry in data:
                timestamp = entry["timestamp"]
                if day_start <= timestamp < day_end:
                    # Parse the payload to check if motion was detected
                    payload = entry["payload"]
                    motion_detected = False
                    if isinstance(payload, str):
                        payload = eval(payload)  # Converts string to dictionary (for demo)
                    if payload.get("motion_detected", False):
                        # Set the motion data for the specific hour
                        hour = timestamp.hour
                        day_data[hour] = 1

            # Append the day's motion data to the list
            motion_data.append({
                "date": day_start.strftime("%Y-%m-%d"),
                "motion_data": day_data
            })
        print(jsonify(motion_data))

        return jsonify(motion_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/motion-insights", methods=["GET"])
def motion_insights():
    """
    Endpoint to fetch insights about motion detection over the last 30 days.
    """
    try:
        # Calculate the start and end of the last 30 days
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)

        # Query MongoDB for motion detection data for the last 30 days
        query = {
            "topic": "home/security/door/motion",
            "timestamp": {
                "$gte": start_date.isoformat(),  # Ensure query is in ISO format
                "$lte": end_date.isoformat()     # Ensure query is in ISO format
            }
        }

        # Fetch the data from the collection
        data = list(collection.find(query, {"_id": 0, "timestamp": 1, "payload": 1}))

        # Initialize variables for insights
        total_motion_count = 0
        daily_motion_counts = {}
        hourly_motion_counts = [0] * 24  # 24-hour distribution

        # Process the data
        for entry in data:
            timestamp = entry["timestamp"]
            motion_detected = False
            if isinstance(timestamp, str):  # If stored as string, parse it to datetime
                timestamp = datetime.fromisoformat(timestamp)
            day = timestamp.strftime("%Y-%m-%d")
            hour = timestamp.hour

            # Parse the payload to check if motion was detected
            payload = entry["payload"]
            if isinstance(payload, str):  # The payload is a string, so we need to parse it
                try:
                    payload = json.loads(payload)  # Safely convert string to dictionary
                    # Convert Unix timestamp to datetime
                    payload_timestamp = payload.get("timestamp", None)
                    if payload_timestamp:
                        payload["timestamp"] = datetime.utcfromtimestamp(payload_timestamp)  # Convert to datetime
                except json.JSONDecodeError as e:
                    print(f"Error parsing payload: {e}")
                    continue  # Skip this entry if payload parsing fails

            motion_detected = payload.get("motion_detected", False)

            if motion_detected:
                total_motion_count += 1
                # Update daily counts
                if day not in daily_motion_counts:
                    daily_motion_counts[day] = 0
                daily_motion_counts[day] += 1
                # Update hourly distribution
                hourly_motion_counts[hour] += 1

        # Identify insights
        max_day = max(daily_motion_counts, key=daily_motion_counts.get, default="N/A")
        min_day = min(daily_motion_counts, key=daily_motion_counts.get, default="N/A")
        peak_hours = [i for i, count in enumerate(hourly_motion_counts) if count == max(hourly_motion_counts)]

        # Construct the insights response
        insights = {
            "total_motion_detections": total_motion_count,
            "daily_motion_counts": daily_motion_counts,
            "peak_hours": peak_hours,
            "day_with_highest_motion": {"date": max_day, "count": daily_motion_counts.get(max_day, 0)},
            "day_with_lowest_motion": {"date": min_day, "count": daily_motion_counts.get(min_day, 0)}
        }

        # Debug: Print the fetched data
        print(f"Fetched data: {insights}")

        return jsonify(insights), 200

    except Exception as e:
        print(f"Error: {e}")  # Log the error
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
