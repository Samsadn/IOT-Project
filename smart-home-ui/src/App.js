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

const App = () => {
  const [motionDetected, setMotionDetected] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [windowOpen, setWindowOpen] = useState(false);
  const [temperature, setTemperature] = useState(20);
  const [temperatureData, setTemperatureData] = useState([]);
  const [cameraImage, setCameraImage] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const [lightOn, setLightOn] = useState(false);
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
      ]);
    });

    client.on("message", (topic, message) => {
      const payload = message.toString();
      console.log("Received message on topic:", topic);

      switch (topic) {
        case MQTT_TOPIC_MOTION:
          setMotionDetected(payload === "true");
          if (payload === "true") {
            setShowImage(true);
            clearTimeout(timeoutId.current);
            timeoutId.current = setTimeout(() => setShowImage(false), 5000);
          }
          break;

        case MQTT_TOPIC_DOOR:
          setDoorOpen(payload === "true");
          break;

        case MQTT_TOPIC_WINDOW:
          setWindowOpen(payload === "true");
          break;

        case MQTT_TOPIC_TEMPERATURE:
          try {
            const tempData = JSON.parse(payload);
            setTemperature(tempData.indoor);
            setTemperatureData((prevData) => [
              ...prevData.slice(-9),
              {
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                indoor: tempData.indoor,
                outdoor: tempData.outdoor,
              },
            ]);
          } catch (error) {
            console.error("Failed to parse temperature payload:", error);
          }
          break;

        case MQTT_TOPIC_CAMERA_IMAGE:
          setCameraImage(payload);
          break;

        case MQTT_TOPIC_LIGHT:
          setLightOn(payload === "true");
          break;

        default:
          console.warn("Unhandled topic:", topic);
          break;
      }
    });

    client.on("error", (error) => {
      console.error("MQTT Connection Error:", error);
    });

    client.on("offline", () => {
      console.warn("MQTT client is offline");
    });

    return () => {
      client.end(true, () => {
        console.log("Disconnected from MQTT Broker");
      });
    };
  }, []);

  return (
    <Box>
      <AppBar position="static">
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

      <Container maxWidth="lg" style={{ marginTop: "20px" }}>
        <Typography variant="h4" align="center" gutterBottom>
          Home Automation Overview
        </Typography>

        <Box mb={4}>
          <Paper elevation={3} style={{ padding: "16px" }}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Indoor Temperature: {temperature}°C</Typography>
              <Typography variant="h6">
                Motion Detected: {motionDetected ? "Yes" : "No"}
              </Typography>
            </Grid>
          </Paper>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={3} style={{ padding: "16px", textAlign: "center" }}>
              <Typography variant="h6">Door Sensor</Typography>
              <Typography variant="body1">Status: {doorOpen ? "Open" : "Closed"}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={3} style={{ padding: "16px", textAlign: "center" }}>
              <Typography variant="h6">Window Sensor</Typography>
              <Typography variant="body1">Status: {windowOpen ? "Open" : "Closed"}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={3} style={{ padding: "16px", textAlign: "center" }}>
              <Typography variant="h6">Light Sensor</Typography>
              <Typography variant="body1">Status: {lightOn ? "On" : "Off"}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} style={{ padding: "16px" }}>
              <Typography variant="h6" gutterBottom>
                Temperature Chart
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="indoor" stroke="#8884d8" />
                  <Line type="monotone" dataKey="outdoor" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} style={{ padding: "16px", textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                Camera Feed
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
