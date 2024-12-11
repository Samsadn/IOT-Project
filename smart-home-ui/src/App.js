import './App.css';
import React, { useState, useEffect, useRef } from "react";
import mqtt from "mqtt";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import "chart.js/auto";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const MQTT_BROKER = "ws://localhost:9001"; // Replace with your broker address
const MQTT_TOPIC_MOTION = "home/security/motion";
const MQTT_TOPIC_DOOR = "home/security/door";
const MQTT_TOPIC_WINDOW = "home/security/window";
const MQTT_TOPIC_TEMPERATURE = "home/sensors/temperature";
const MQTT_TOPIC_CAMERA_IMAGE = "home/camera/door/image";
const MQTT_TOPIC_CAMERA_MOTION = "home/camera/door/motion";
const MQTT_TOPIC_LIGHT = "home/security/light";  // Topic for light sensor data

function App() {
  const [motionDetected, setMotionDetected] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [windowOpen, setWindowOpen] = useState(false);
  const [temperature, setTemperature] = useState(20);
  const [temperatureData, setTemperatureData] = useState([]);
  const [cameraImage, setCameraImage] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const [lightOn, setLightOn] = useState(false);  // New state for light sensor
  const timeoutId = useRef(null);

  useEffect(() => {
    const client = mqtt.connect(MQTT_BROKER);

    client.on("connect", () => {
      console.log("Connected to MQTT Broker!");
      client.subscribe(MQTT_TOPIC_MOTION);
      client.subscribe(MQTT_TOPIC_DOOR);
      client.subscribe(MQTT_TOPIC_WINDOW);
      client.subscribe(MQTT_TOPIC_TEMPERATURE);
      client.subscribe(MQTT_TOPIC_CAMERA_IMAGE);
      client.subscribe(MQTT_TOPIC_CAMERA_MOTION);
      client.subscribe(MQTT_TOPIC_LIGHT);  // Subscribe to light sensor topic
    });

    client.on("message", (topic, message) => {
      if (topic === MQTT_TOPIC_MOTION) {
        const motionData = JSON.parse(message.toString());
        const motionDetected = motionData.motion_detected;
        setMotionDetected(motionDetected);

        // Always set the door state based on motion detection
        setDoorOpen(motionDetected);  // If motion is detected, door is open, otherwise closed
      }

          // We no longer need to listen to the door sensor state, as it should always mirror motion
          // else if (topic === MQTT_TOPIC_DOOR) {
          //   const doorData = JSON.parse(message.toString());
          //   setDoorOpen(doorData.door_open);
      // }

      else if (topic === MQTT_TOPIC_WINDOW) {
        setWindowOpen(JSON.parse(message.toString()).window_open);
      } else if (topic === MQTT_TOPIC_TEMPERATURE) {
        const tempData = JSON.parse(message.toString());
        setTemperature(tempData.temperature);
        setTemperatureData((prevData) => {
          const newData = [...prevData, tempData.temperature];
          if (newData.length > 10) {
            newData.shift();  // Keep only the latest 10 readings
          }
          return newData;
        });
      } else if (topic === MQTT_TOPIC_CAMERA_IMAGE) {
        setCameraImage(message.toString());
        setShowImage(true); // Show the image immediately when it arrives

        // Clear existing timeout to avoid premature hiding
        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
        }

        // Set timeout to hide the image after 5 seconds
        timeoutId.current = setTimeout(() => {
          setShowImage(false);
        }, 5000);
      } else if (topic === MQTT_TOPIC_LIGHT) {
        // Handle light sensor data
        setLightOn(JSON.parse(message.toString()).light_on); // Update light state
      }
    });

    // Clean up on unmount
    return () => {
      if (client.connected) {
        client.end();
      }
    };
  }, []);  // Empty dependency array, as we want to listen for messages without relying on state changes

  const chartData = {
    labels: Array.from({length: temperatureData.length}, (_, i) => i + 1),
    datasets: [
      {
        label: "Temperature (°C)",
        data: temperatureData,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  return (
      <div className="App bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 min-h-screen flex flex-col items-center px-6 py-8 font-sans">

        {/* Temperature Display Section */}
        <div className="temperature-data bg-blue-500 text-white p-4 rounded-lg w-full max-w-5xl flex justify-between items-center mb-6">
          <span className="text-xl font-bold">Current Indoor Temperature: {temperature} °C</span>
        </div>

        {/* Main Title of the Dashboard */}
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-8 text-center shadow-md transform transition duration-300 ease-in-out hover:scale-105">
          My Smart Home
        </h1>

        {/* Grid Layout for Sections */}
        <div className="grid gap-6 w-full max-w-5xl grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

          {/* Sensor Data Section */}
          <div className="sensor-data bg-white p-6 rounded-lg shadow-md col-span-2 lg:col-span-1">
            <h2 className="text-xl font-bold mb-4 text-gray-800">My Sensors</h2>
            <div className="grid gap-4">
              {/* Motion Sensor */}
              <div className="sensor-grid motion">
                <span className="sensor-label">Motion:</span>
                <span className={`sensor-value ${motionDetected ? "active text-green-500" : "inactive text-red-500"}`}>
                {motionDetected ? "Detected" : "Not Detected"}
              </span>
              </div>

              {/* Door Sensor */}
              <div className="sensor-grid door">
                <span className="sensor-label">Door:</span>
                <span className={`sensor-value ${doorOpen ? "warning text-orange-500" : "active text-green-500"}`}>
                {doorOpen ? "Open" : "Closed"}
              </span>
              </div>

              {/* Window Sensor */}
              <div className="sensor-grid window">
                <span className="sensor-label">Window:</span>
                <span className={`sensor-value ${windowOpen ? "inactive text-red-500" : "active text-green-500"}`}>
                {windowOpen ? "Open" : "Closed"}
              </span>
              </div>

              {/* Light Sensor */}
              <div className="sensor-grid light">
                <span className="sensor-label">Light:</span>
                <span className={`sensor-value ${lightOn ? "active text-yellow-500" : "inactive text-gray-500"}`}>
                {lightOn ? "On" : "Off"}
              </span>
              </div>
            </div>
          </div>

          {/* Temperature Chart and Door Camera Section side by side */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-6 w-full max-w-5xl">

            {/* Temperature Chart */}
            <div className="temp-chart p-6 bg-white rounded-lg shadow-md mb-6 lg:mb-0">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Temperature Chart</h3>
              <Line data={chartData}/>
            </div>

            {/* Camera Image Section */}
            <div className="camera-image p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Door Camera</h2>
              {cameraImage && showImage ? (
                  <img
                      src={`data:image/jpeg;base64,${cameraImage}`}
                      alt="Door Camera"
                      className="border-2 border-gray-300 rounded-lg shadow-md max-w-xs mx-auto"
                  />
              ) : (
                  <p className="text-gray-600 text-center">No motion at the door</p>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

export default App;
