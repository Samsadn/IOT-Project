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

function App() {
  const [motionDetected, setMotionDetected] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [windowOpen, setWindowOpen] = useState(false);
  const [temperature, setTemperature] = useState(20);
  const [temperatureData, setTemperatureData] = useState([]);
  const [cameraImage, setCameraImage] = useState(null);
  const [showImage, setShowImage] = useState(false);
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
    });

    client.on("message", (topic, message) => {
      if (topic === MQTT_TOPIC_MOTION) {
        setMotionDetected(JSON.parse(message.toString()).motion_detected);
      } else if (topic === MQTT_TOPIC_DOOR) {
        setDoorOpen(JSON.parse(message.toString()).door_open);
      } else if (topic === MQTT_TOPIC_WINDOW) {
        setWindowOpen(JSON.parse(message.toString()).window_open);
      } else if (topic === MQTT_TOPIC_TEMPERATURE) {
        const tempData = JSON.parse(message.toString());
        setTemperature(tempData.temperature);
        setTemperatureData((prevData) => {
          const newData = [...prevData, tempData.temperature];
          if (newData.length > 10) {
            newData.shift();
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
      }
    });

    // Clean up on unmount
    return () => {
      if (client.connected) {
        client.end();
      }
    };
  }, []);

  const chartData = {
    labels: Array.from({ length: temperatureData.length }, (_, i) => i + 1),
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
    <div className="App p-8 bg-gradient-to-r from-blue-200 to-purple-200 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
        Smart Home Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sensor Data */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Sensors</h2>
          <ul className="list-disc pl-5">
            <li className="flex items-center justify-between py-2">
              <span className="text-gray-700">Motion:</span>
              <span
                className={`font-bold ${
                  motionDetected ? "text-red-500" : "text-green-500"
                }`}
              >
                {motionDetected ? "Detected" : "Not Detected"}
              </span>
            </li>
            <li className="flex items-center justify-between py-2">
              <span className="text-gray-700">Door:</span>
              <span
                className={`font-bold ${
                  doorOpen ? "text-red-500" : "text-green-500"
                }`}
              >
                {doorOpen ? "Open" : "Closed"}
              </span>
            </li>
            <li className="flex items-center justify-between py-2">
              <span className="text-gray-700">Window:</span>
              <span
                className={`font-bold ${
                  windowOpen ? "text-red-500" : "text-green-500"
                }`}
              >
                {windowOpen ? "Open" : "Closed"}
              </span>
            </li>
            <li className="flex items-center justify-between py-2">
              <span className="text-gray-700">Temperature:</span>
              <span className="font-bold">{temperature} °C</span>
            </li>
          </ul>
        </div>

        {/* Temperature Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md col-span-2 lg:col-span-1">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Temperature Chart
          </h2>
          <Line data={chartData} />
        </div>

        {/* Camera Image */}
        <div className="bg-white p-6 rounded-lg shadow-md col-span-2 lg:col-span-1">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Door Camera</h2>
          {cameraImage && showImage ? ( // Use showImage here to control visibility
            <img
              src={`data:image/jpeg;base64,${cameraImage}`}
              alt="Door Camera"
              className="border-2 border-gray-300 rounded-lg shadow-md max-w-xs mx-auto"
            />
          ) : (
            <p className="text-gray-600 text-center">No image available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
