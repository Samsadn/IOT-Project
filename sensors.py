import paho.mqtt.client as mqtt
import json
import time
import random
import base64
from builtins import FileNotFoundError, print, open, round

# --- MQTT Configuration ---
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC_DOOR_MOTION = "home/security/door/motion"
MQTT_TOPIC_DOOR = "home/security/door"
MQTT_TOPIC_WINDOW_MOTION = "home/security/window/motion"
MQTT_TOPIC_WINDOW = "home/security/window"
MQTT_TOPIC_TEMPERATURE = "home/sensors/temperature"
MQTT_TOPIC_DOOR_CAMERA_IMAGE = "home/camera/door/image"
MQTT_TOPIC_DOOR_CAMERA_MOTION = "home/camera/door/motion"
MQTT_TOPIC_WINDOW_CAMERA_IMAGE = "home/camera/window/image"
MQTT_TOPIC_WINDOW_CAMERA_MOTION = "home/camera/window/motion"
MQTT_TOPIC_LIGHT = "home/security/light"  # Topic for light sensor data
MQTT_TOPIC_SMOKE = "home/security/smoke"  # Topic for smoke sensor data

# --- Sensor Data Simulation Functions ---
def simulate_door_motion_sensor():
    """Simulates motion sensor data."""
    motion_detected = random.choice([True, False])
    return {
        "sensor": "motion_sensor_1",
        "motion_detected": motion_detected,
        "timestamp": time.time()
    }

# --- Sensor Data Simulation Functions ---
def simulate_window_motion_sensor():
    """Simulates motion sensor data."""
    motion_detected = random.choice([True, False])
    return {
        "sensor": "motion_sensor_1",
        "motion_detected": motion_detected,
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

def capture_door_image():
    """Simulates capturing an image from the camera."""
    try:
        with open("placeholder_image_1_40.jpg", "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
        return {
        "sensor": "door_camera_1",
        "image": encoded_string,
        "timestamp": time.time()
    }
    except FileNotFoundError:
        print("Error: Placeholder image not found.")
        return None
    
def capture_window_image():
    """Simulates capturing an image from the camera."""
    try:
        with open("window-image.jpg", "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
        return {
        "sensor": "window_camera_1",
        "image": encoded_string,
        "timestamp": time.time()
    }
    except FileNotFoundError:
        print("Error: Placeholder image not found.")
        return None

def simulate_light_sensor(motion_detected):
    """Simulates light sensor data based on motion detection."""
    # Light is on when motion is detected, off otherwise
    light_on = motion_detected
    return {
        "sensor": "light_sensor_1",
        "light_on": light_on,
        "timestamp": time.time()
    }

def simulate_smoke_sensor():
    """Simulates smoke sensor data."""
    # Create a list with 20 True values and 80 False values
    result = [True] * 20 + [False] * 80

    # Shuffle the list to randomize the order
    random.shuffle(result)
    
    # Randomly select a value from the shuffled list
    smoke_detected = random.choice(result)

    return {
        "sensor": "smoke_sensor_1",
        "smoke_detected": smoke_detected,
        "timestamp": time.time()
    }
# --- MQTT Client Setup ---
def on_connect(client, userdata, flags, rc, properties=None):
    """Callback for MQTT connect."""
    if rc == 0:
        print("Connected to MQTT Broker!")
    else:
        print(f"Failed to connect, return code {rc}")

client = mqtt.Client(protocol=mqtt.MQTTv5)
client.on_connect = on_connect
client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.loop_start()

# --- Publish Sensor Data ---
motion_detected = False  # Tracks the last motion state

while True:
    # Simulate and publish door motion sensor data
    current_door_motion_data = simulate_door_motion_sensor()
    current_door_motion = current_door_motion_data["motion_detected"]
    client.publish(MQTT_TOPIC_DOOR_MOTION, json.dumps(current_door_motion_data))
    print("Published Door Motion Sensor Data:", json.dumps(current_door_motion_data, indent=4))

    # Simulate and publish window motion sensor data
    current_window_motion_data = simulate_window_motion_sensor()
    current_window_motion = current_window_motion_data["motion_detected"]
    client.publish(MQTT_TOPIC_WINDOW_MOTION, json.dumps(current_window_motion_data))
    print("Published Window Motion Sensor Data:", json.dumps(current_window_motion_data, indent=4))

    # Simulate and publish temperature sensor data
    temperature_data = simulate_temperature_sensor()
    client.publish(MQTT_TOPIC_TEMPERATURE, json.dumps(temperature_data))
    print("Published Temperature Sensor Data:", json.dumps(temperature_data, indent=4))

    # Simulate light sensor data based on motion detection
    light_data = simulate_light_sensor(current_door_motion)
    client.publish(MQTT_TOPIC_LIGHT, json.dumps(light_data))
    print("Published Light Sensor Data:", json.dumps(light_data, indent=4))

    # Simulate and publish smoke sensor data
    smoke_data = simulate_smoke_sensor()
    client.publish(MQTT_TOPIC_SMOKE, json.dumps(smoke_data))
    print("Published smoke Sensor Data:", json.dumps(smoke_data, indent=4))

    # Publish image only when door motion state changes to True
    if current_door_motion and not motion_detected:
        image_data = capture_door_image()
        if image_data:
            client.publish(MQTT_TOPIC_DOOR_CAMERA_IMAGE, json.dumps(image_data))
            client.publish(MQTT_TOPIC_DOOR_CAMERA_MOTION, "1")
            print("Published Door Camera Image", json.dumps(image_data))

    # Publish image only when window motion state changes to True
    if current_window_motion and not motion_detected:
        image_data = capture_window_image()
        if image_data:
            client.publish(MQTT_TOPIC_WINDOW_CAMERA_IMAGE, json.dumps(image_data))
            client.publish(MQTT_TOPIC_WINDOW_CAMERA_MOTION, "1")
            print("Published Window Camera Image", json.dumps(image_data))

    # Update the motion state

    # Wait for 5 seconds before sending the next set of data
    time.sleep(5)
