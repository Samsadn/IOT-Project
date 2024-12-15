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

const MQTT_BROKER = "ws://localhost:9001";
const MQTT_TOPIC_MOTION = "home/security/motion";
const MQTT_TOPIC_DOOR = "home/security/door";
const MQTT_TOPIC_WINDOW = "home/security/window";
const MQTT_TOPIC_TEMPERATURE = "home/sensors/temperature";
const MQTT_TOPIC_CAMERA_IMAGE = "home/camera/door/image";
const MQTT_TOPIC_CAMERA_MOTION = "home/camera/door/motion";
const MQTT_TOPIC_LIGHT = "home/security/light";
const MQTT_TOPIC_SMOKE = "home/security/smoke";

const App = () => {
  const [motionDetected, setMotionDetected] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [windowOpen, setWindowOpen] = useState(false);
  const [temperature, setTemperature] = useState(20);
  const [temperatureData, setTemperatureData] = useState([]);
  const [cameraImage, setCameraImage] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const [lightOn, setLightOn] = useState(false);
  const [smokeDetected, setSmokeDetected] = useState(false);
  const timeoutId = useRef(null);

  useEffect(() => {
    const client = mqtt.connect(MQTT_BROKER);

    client.on("connect", () => {
      console.log("Connected to MQTT Broker!");
      client.subscribe([
        MQTT_TOPIC_MOTION,
        MQTT_TOPIC_DOOR,
        MQTT_TOPIC_WINDOW,
        MQTT_TOPIC_TEMPERATURE,
        MQTT_TOPIC_CAMERA_IMAGE,
        MQTT_TOPIC_CAMERA_MOTION,
        MQTT_TOPIC_LIGHT,
        MQTT_TOPIC_SMOKE,
      ]);
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
      {/* AppBar */}
      <AppBar
        position="static"
        style={{
          background: "linear-gradient(90deg, #1976D2, #388E3C)",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Smart Home Dashboard
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>

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
            </Paper>
          </Grid>

          {/* Motion Sensor */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              style={{
                padding: "16px",
                textAlign: "center",
                backgroundColor: motionDetected ? "#E3F2FD" : "#ECEFF1",
                color: motionDetected ? "#1976D2" : "#757575",
              }}
            >
              <Typography variant="h6" gutterBottom>
              <b>Motion Sensor</b>
              </Typography>
              <Typography variant="body1">
                Status: {motionDetected ? "Detected" : "Not Detected"}
              </Typography>
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
            </Paper>
          </Grid>

           {/* Smoke Detector Sensor */}
           <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              style={{
                padding: "16px",
                textAlign: "center",
                backgroundColor: lightOn ? "#ff4d4d" : "#80ff80",
                color: lightOn ? "#000000" : "#000000",
              }}
            >
              <Typography variant="h6" gutterBottom>
                <b>Smoke Detector Sensor</b>
              </Typography>
              <Typography variant="body1">
                Status: {lightOn ? "On" : "Off"}
              </Typography>
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
          
          {/* Camera Feed */}
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
                <b>Camera Feed</b>
              </Typography>
              {showImage && cameraImage ? (
                <Box
                  component="img"
                  src={`data:image/jpeg;base64,${cameraImage}`}
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
