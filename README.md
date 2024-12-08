# Smart Home IoT Project

This project demonstrates a smart home IoT system that simulates sensors, transmits data via MQTT using Eclipse Mosquitto, and visualizes the data in real-time through a React dashboard.

## Components Overview

1. **Eclipse Mosquitto MQTT Broker**: Facilitates communication between sensors (publisher) and the dashboard (subscriber).
2. **Python Sensor Simulator**: Publishes simulated sensor data to the MQTT broker.
3. **React Dashboard**: Subscribes to the MQTT broker and visualizes data.

---

## Setup and Execution

### 1. Install and Configure Mosquitto MQTT Broker

#### macOS

1. **Install Mosquitto**:

   ```bash
   brew install mosquitto
   ```

2. **Start Mosquitto**:

   ```bash
   brew services start mosquitto
   ```

3. **Verify Installation**:

   ```bash
   mosquitto -v
   ```

4. **Update Configuration**:

   - Locate the `mosquitto.conf` file:
     ```bash
     ps aux | grep mosquitto
     ```
   - Add the following configuration:
     ```
     listener 9001
     protocol websockets

     listener 1883
     allow_anonymous true
     ```
   - Restart Mosquitto:
     ```bash
     brew services restart mosquitto
     ```

#### Windows

1. **Download Mosquitto**:

   - Download the installer from [Eclipse Mosquitto Downloads](https://mosquitto.org/download/).

2. **Install Mosquitto**:

   - Follow the installation wizard to complete the setup.

3. **Update Configuration**:

   - Locate the `mosquitto.conf` file (usually in the installation directory, e.g C:\Program Files\mosquitto).
   - Add the following lines:
     ```
     listener 9001
     protocol websockets

     listener 1883
     allow_anonymous true
     ```
   - Save the file and restart Mosquitto using:
     ```cmd
     net stop mosquitto
     net start mosquitto
     ```

### 2. Set Up the Python Sensor Simulator

#### Prerequisites

- Install Python 3.x.
- Install required dependencies:
  ```bash
  pip install paho-mqtt
  ```

#### Steps

1. Clone the project repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Update the `MQTT_BROKER` variable in the `sensors.py` file to:

   ```python
   MQTT_BROKER = "localhost"
   MQTT_PORT = 1883
   ```

3. Run the simulator:

   ```bash
   python sensors.py
   ```

### 3. Set Up the React Dashboard

#### Prerequisites

- Install Node.js and npm.

#### Steps

1. Navigate to the React dashboard directory:
   ```bash
   cd <repository-directory>/smart-home-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```
   This will display the Smart Home Dashboard, where real-time sensor data will be visualized.

---

## Summary

1. Install and configure Mosquitto MQTT Broker.
2. Run the Python sensor simulator to publish simulated sensor data.
3. Launch the React dashboard to visualize data in real time.

Ensure all components are running simultaneously for full functionality.
