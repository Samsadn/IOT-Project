import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Switch,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import mqtt from "mqtt";
import axios from "axios";

const MQTT_BROKER = "ws://localhost:9001"; // Replace with your broker address
const MQTT_TOPIC_DOOR_MOTION = "home/security/door/motion"
const MQTT_TOPIC_DOOR = "home/security/door"
const MQTT_TOPIC_WINDOW_MOTION = "home/security/window/motion"
const MQTT_TOPIC_WINDOW = "home/security/window"
const MQTT_TOPIC_TEMPERATURE = "home/sensors/temperature"
const MQTT_TOPIC_DOOR_CAMERA_IMAGE = "home/camera/door/image"
const MQTT_TOPIC_DOOR_CAMERA_MOTION = "home/camera/door/motion"
const MQTT_TOPIC_WINDOW_CAMERA_IMAGE = "home/camera/window/image"
const MQTT_TOPIC_WINDOW_CAMERA_MOTION = "home/camera/window/motion"
const MQTT_TOPIC_LIGHT = "home/security/light"
const MQTT_TOPIC_SMOKE = "home/security/smoke" 

const App = () => {
  const [doorMotionDetected, setDoorMotionDetected] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [windowMotionDetected, setWindowMotionDetected] = useState(false);
  const [windowOpen, setWindowOpen] = useState(false);
  const [temperature, setTemperature] = useState(20);
  const [temperatureData, setTemperatureData] = useState([]);
  const [doorCameraImage, setDoorCameraImage] = useState(null);
  const [showDoorImage, setShowDoorImage] = useState(false);
  const [windowCameraImage, setWindowCameraImage] = useState(null);
  const [showWindowImage, setShowWindowImage] = useState(false);
  const [lightOn, setLightOn] = useState(false);
  const [smokeDetected, setSmokeDetected] = useState(false);
  const doorCameraTimeoutId = useRef(null);
  const windowCameraTimeoutId = useRef(null);

  useEffect(() => {
    const client = mqtt.connect(MQTT_BROKER);

    client.on("connect", () => {
      console.log("Connected to MQTT Broker!");
      client.subscribe([
        MQTT_TOPIC_DOOR_MOTION,
        MQTT_TOPIC_DOOR,
        MQTT_TOPIC_WINDOW_MOTION,
        MQTT_TOPIC_WINDOW,
        MQTT_TOPIC_TEMPERATURE,
        MQTT_TOPIC_DOOR_CAMERA_IMAGE,
        MQTT_TOPIC_DOOR_CAMERA_MOTION,
        MQTT_TOPIC_WINDOW_CAMERA_IMAGE,
        MQTT_TOPIC_WINDOW_CAMERA_MOTION,
        MQTT_TOPIC_LIGHT,
        MQTT_TOPIC_SMOKE,
      ]);
    });

    client.on("message", async (topic, message) => {

      const parsedMessage = message.toString();
      const data = { topic, payload: parsedMessage, timestamp: new Date().toISOString() };

      try {
        // Send data to the Python server
        await axios.post("http://localhost:5000/save-mqtt-data", data);
        console.log("Data sent to backend:", data);
      } catch (err) {
        console.error("Error sending data to backend:", err);
      }

      if (topic === MQTT_TOPIC_DOOR_MOTION) {
        const motionData = JSON.parse(message.toString());
        const doorMotionDetected = motionData.motion_detected;
        setDoorMotionDetected(doorMotionDetected);

        // Always set the door state based on motion detection
        // setDoorOpen(doorMotionDetected);  // If motion is detected, door is open, otherwise closed
      }

          // We no longer need to listen to the door sensor state, as it should always mirror motion
          // else if (topic === MQTT_TOPIC_DOOR) {
          //   const doorData = JSON.parse(message.toString());
          //   setDoorOpen(doorData.door_open);
      // }

      // else if (topic === MQTT_TOPIC_WINDOW) {
      //   setWindowOpen(JSON.parse(message.toString()).window_open);
      // } 

      if (topic === MQTT_TOPIC_WINDOW_MOTION) {
        const motionData = JSON.parse(message.toString());
        const windowMotionDetected = motionData.motion_detected;
        setWindowMotionDetected(windowMotionDetected);

        // Always set the window state based on motion detection
        // setWindowOpen(windowMotionDetected);  // If motion is detected, door is open, otherwise closed
      }

      else if (topic === MQTT_TOPIC_TEMPERATURE) {
        const tempData = JSON.parse(message.toString());
        setTemperature(tempData.temperature);
      
        // Update temperature data for the chart
        setTemperatureData((prevData) => {
          const newData = [
            ...prevData.slice(-9), // Keep only the latest 9 readings
            {
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }), // Format timestamp
              indoor: tempData.temperature, // Map temperature to indoor
            },
          ];
          // console.log("Updated temperatureData:", newData); // Debugging log
          return newData;
        });
      } else if (topic === MQTT_TOPIC_DOOR_CAMERA_IMAGE) {
        const imageData = JSON.parse(message.toString());

        // Extract the image data
        const base64Image = imageData.image;

        setDoorCameraImage(base64Image);
        setShowDoorImage(true); // Show the image immediately when it arrives

        // Clear existing timeout to avoid premature hiding
        if (doorCameraTimeoutId.current) {
          clearTimeout(doorCameraTimeoutId.current);
        }

        // Set timeout to hide the image after 5 seconds
        doorCameraTimeoutId.current = setTimeout(() => {
          setShowDoorImage(false);
        }, 5000);
      } else if (topic === MQTT_TOPIC_WINDOW_CAMERA_IMAGE) {
        const imageData = JSON.parse(message.toString());

        // Extract the image data
        const base64Image = imageData.image;

        setWindowCameraImage(base64Image);
        setShowWindowImage(true); // Show the image immediately when it arrives

        // Clear existing timeout to avoid premature hiding
        if (windowCameraTimeoutId.current) {
          clearTimeout(windowCameraTimeoutId.current);
        }

        // Set timeout to hide the image after 5 seconds
        windowCameraTimeoutId.current = setTimeout(() => {
          setShowWindowImage(false);
        }, 5000);
      } else if (topic === MQTT_TOPIC_LIGHT) {
        // Handle light sensor data
        setLightOn(JSON.parse(message.toString()).light_on); // Update light state
      } else if (topic === MQTT_TOPIC_SMOKE) {
        setSmokeDetected(JSON.parse(message.toString()).smoke_detected);
      }
    });

    return () => {
      client.end(true, () => {
        console.log("Disconnected from MQTT Broker");
      });
    };
  }, []);

  return (
    <Box>
      {/* Main Container */}
      <Container maxWidth="lg" style={{ marginTop: "20px" }}>
        <Typography variant="h4" align="center" gutterBottom>
          Smart Home Security Dashboard
        </Typography>

        {/* Sensor Grid */}
        <Grid container spacing={4}>
          {/* Door Sensor */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              style={{
                padding: "16px",
                textAlign: "center",
                backgroundColor: doorOpen ? "#FFEBEE" : "#E8F5E9",
                color: doorOpen ? "#D32F2F" : "#388E3C",
              }}
            >
              <Typography variant="h6" gutterBottom>
                <b>Door Sensor</b>
              </Typography>
              <Typography variant="body1">
                Status: {doorOpen ? "Open" : "Closed"}
              </Typography>
              {/* Toggle Button */}
              <div style={{ marginTop: "16px" }}>
              {/*<Typography variant="body2">Toggle Door Status:</Typography>*/}
                <Switch
                  checked={doorOpen}
                  onChange={(event) => setDoorOpen(event.target.checked)}
                  color="primary"
                />
              </div>
            </Paper>
          </Grid>


          {/* Window Sensor */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              style={{
                padding: "16px",
                textAlign: "center",
                backgroundColor: windowOpen ? "#FFF3E0" : "#E3F2FD",
                color: windowOpen ? "#F57C00" : "#1976D2",
              }}
            >
              <Typography variant="h6" gutterBottom>
                <b>Window Sensor</b>
              </Typography>
              <Typography variant="body1">
                Status: {windowOpen ? "Open" : "Closed"}
              </Typography>
              {/* Toggle Button */}
              <div style={{ marginTop: "16px" }}>
              {/*<Typography variant="body2">Toggle Door Status:</Typography>*/}
                <Switch
                  checked={windowOpen}
                  onChange={(event) => setWindowOpen(event.target.checked)}
                  color="primary"
                />
              </div>
            </Paper>
          </Grid>

          {/* Light Sensor */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              style={{
                padding: "16px",
                textAlign: "center",
                backgroundColor: lightOn ? "#FFFDE7" : "#ECEFF1",
                color: lightOn ? "#FBC02D" : "#757575",
              }}
            >
              <Typography variant="h6" gutterBottom>
              <b>Light Sensor</b>
              </Typography>
              <Typography variant="body1">
                Status: {lightOn ? "On" : "Off"}
              </Typography>
              {/* Toggle Button */}
              <div style={{ marginTop: "16px" }}>
              {/*<Typography variant="body2">Toggle Door Status:</Typography>*/}
                <Switch
                  checked={lightOn}
                  onChange={(event) => setLightOn(event.target.checked)}
                  color="primary"
                />
              </div>
            </Paper>
          </Grid>

          {/* Door Motion Sensor */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              style={{
                padding: "16px",
                textAlign: "center",
                backgroundColor: doorMotionDetected ? "#E3F2FD" : "#ECEFF1",
                color: doorMotionDetected ? "#1976D2" : "#757575",
              }}
            >
              <Typography variant="h6" gutterBottom>
              <b>Door Motion Sensor</b>
              </Typography>
              <Typography variant="body1">
                Status: {doorMotionDetected ? "Detected" : "Not Detected"}
              </Typography>
            </Paper>
          </Grid>

           {/* Smoke Detector Sensor */}
           <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              style={{
                padding: "16px",
                textAlign: "center",
                backgroundColor: smokeDetected ? "#ff4d4d" : "#80ff80",
                color: smokeDetected ? "#000000" : "#000000",
              }}
            >
              <Typography variant="h6" gutterBottom>
                <b>Smoke Detector Sensor</b>
              </Typography>
              <Typography variant="body1">
                Status: {smokeDetected ? "Smoke Detected - Take Action!" : "No Smoke - System Normal"}
              </Typography>
            </Paper>
          </Grid>

          {/* Window Motion Sensor */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              style={{
                padding: "16px",
                textAlign: "center",
                backgroundColor: windowMotionDetected ? "#E3F2FD" : "#ECEFF1",
                color: windowMotionDetected ? "#1976D2" : "#757575",
              }}
            >
              <Typography variant="h6" gutterBottom>
              <b>Window Motion Sensor</b>
              </Typography>
              <Typography variant="body1">
                Status: {windowMotionDetected ? "Detected" : "Not Detected"}
              </Typography>
            </Paper>
          </Grid>
          
          {/* Door Camera Feed */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              style={{
                padding: "16px",
                textAlign: "center",
                backgroundColor: "#FBE9E7", // Light coral for camera
                color: "#D84315", // Text color
              }}
            >
              <Typography variant="h6" gutterBottom>
                <b>Door Camera Feed</b>
              </Typography>
              {showDoorImage && doorCameraImage ? (
                <Box
                  component="img"
                  src={`data:image/jpeg;base64,${doorCameraImage}`}
                  alt="Camera Feed"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: "8px",
                    border: "2px solid #D84315",
                  }}
                />
              ) : (
                <Typography variant="body1">No motion detected.</Typography>
              )}
            </Paper>
          </Grid>

          {/* Window Camera Feed */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              style={{
                padding: "16px",
                textAlign: "center",
                backgroundColor: "#FBE9E7", // Light coral for camera
                color: "#D84315", // Text color
              }}
            >
              <Typography variant="h6" gutterBottom>
                <b>Window Camera Feed</b>
              </Typography>
              {showWindowImage && windowCameraImage ? (
                <Box
                  component="img"
                  src={`data:image/jpeg;base64,${windowCameraImage}`}
                  alt="Camera Feed"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: "8px",
                    border: "2px solid #D84315",
                  }}
                />
              ) : (
                <Typography variant="body1">No motion detected.</Typography>
              )}
            </Paper>
          </Grid>

                    {/* Temperature Chart */}
                    <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              style={{
                padding: "16px",
                backgroundColor: "#E3F2FD",
              }}
            >
              <Typography variant="h6" gutterBottom style={{ color: "#1976D2" }}>
                <b>Temperature Chart</b>
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="indoor" stroke="#388E3C" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        <Box mt={4}>
          <Typography align="center" variant="body2">
            &copy; 2024 Smart Home Inc. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default App;
