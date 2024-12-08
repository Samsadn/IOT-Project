import paho.mqtt.client as mqtt
import json
import time
import random
import base64

# --- MQTT Configuration ---
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC_MOTION = "home/security/motion"
MQTT_TOPIC_DOOR = "home/security/door"
MQTT_TOPIC_WINDOW = "home/security/window"
MQTT_TOPIC_TEMPERATURE = "home/sensors/temperature"
MQTT_TOPIC_CAMERA_IMAGE = "home/camera/door/image"
MQTT_TOPIC_CAMERA_MOTION = "home/camera/door/motion"

# --- Sensor Data Simulation Functions ---
def simulate_motion_sensor():
    """Simulates motion sensor data."""
    motion_detected = random.choice([True, False])
    return {
        "sensor": "motion_sensor_1",
        "motion_detected": motion_detected,
        "timestamp": time.time()
    }

def simulate_door_sensor():
    """Simulates door sensor data."""
    door_open = random.choice([True, False])
    return {
        "sensor": "door_sensor_1",
        "door_open": door_open,
        "timestamp": time.time()
    }

def simulate_window_sensor():
    """Simulates window sensor data."""
    window_open = random.choice([True, False])
    return {
        "sensor": "window_sensor_1",
        "window_open": window_open,
        "timestamp": time.time()
    }

def simulate_temperature_sensor():
    """Simulates temperature sensor data."""
    temperature = round(random.uniform(20, 30), 2)
    return {
        "sensor": "temperature_sensor_1",
        "temperature": temperature,
        "timestamp": time.time()
    }

def capture_image():
    """Simulates capturing an image from the camera."""
    try:
        with open("placeholder_image_1_40.jpg", "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
        return encoded_string
    except FileNotFoundError:
        print("Error: Placeholder image not found.")
        return None

# --- MQTT Client Setup ---
def on_connect(client, userdata, flags, rc):
    """Callback for MQTT connect."""
    if rc == 0:
        print("Connected to MQTT Broker!")
    else:
        print(f"Failed to connect, return code {rc}")

client = mqtt.Client()
client.on_connect = on_connect
client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.loop_start()

# --- Publish Sensor Data ---
motion_detected = False  # Tracks the last motion state

while True:
    # Simulate and publish motion sensor data
    current_motion_data = simulate_motion_sensor()
    current_motion = current_motion_data["motion_detected"]
    client.publish(MQTT_TOPIC_MOTION, json.dumps(current_motion_data))

    # Simulate and publish other sensor data
    client.publish(MQTT_TOPIC_DOOR, json.dumps(simulate_door_sensor()))
    client.publish(MQTT_TOPIC_WINDOW, json.dumps(simulate_window_sensor()))
    client.publish(MQTT_TOPIC_TEMPERATURE, json.dumps(simulate_temperature_sensor()))

    # Publish image only when motion state changes to True
    if current_motion and not motion_detected:
        image_data = capture_image()
        if image_data:
            client.publish(MQTT_TOPIC_CAMERA_IMAGE, image_data)
            client.publish(MQTT_TOPIC_CAMERA_MOTION, "1")
    
    # Update the motion state
    motion_detected = current_motion

    # Wait for 5 seconds before sending the next set of data
    time.sleep(5)
