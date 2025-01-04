import React, { useEffect, useState } from "react";
import axios from "axios";
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  BarChart,
  Bar,
  Cell,
  ReferenceLine
} from "recharts";

const MotionChart = () => {
  const [motionData, setMotionData] = useState([]);
  const [insightData, setInsightData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [motionResponse, insightResponse] = await Promise.all([
          fetch('http://localhost:5000/fetch-motion-data'),
          fetch('http://localhost:5000/motion-insights')
        ]);

        if (!motionResponse.ok || !insightResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const motionResult = await motionResponse.json();
        const insightResult = await insightResponse.json();

        setMotionData(motionResult);
        setInsightData(insightResult);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Default values for insights
  const {
    total_motion_detections = 0,
    peak_hours = [],
    day_with_highest_motion = { date: 'N/A', count: 0 },
    day_with_lowest_motion = { date: 'N/A', count: 0 }
  } = insightData || {};

  // Format data for Recharts (LineChart)
  const formattedData = motionData.map((day) => ({
    date: day.date,
    ...day.motion_data.reduce((acc, value, index) => {
      acc[`hour_${index}`] = value ? 1 : 0; // 1 = motion, 0 = no motion
      return acc;
    }, {}),
  }));

  // Format data for Heatmap (BarChart)
  const heatmapData = motionData.map((day) => ({
    day: day.date,
    hours: day.motion_data.map((value, index) => ({
      hour: index,
      motionDetected: value ? 1 : 0, // 1 = motion, 0 = no motion
    }))
  }));

  // Function to determine color based on motion detection intensity
  const getBarColor = (motionCount) => {
    if (motionCount === 0) {
      return '#f0f0f0'; // Light grey for no motion
    } else if (motionCount === 1) {
      return '#81c784'; // Green for detected motion
    } else {
      return '#e57373'; // Red for high motion
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Container>
      <Box my={5}>
        <Typography variant="h4" align="center" gutterBottom>
          Motion Detection Overview
        </Typography>

        {/* Insights Cards */}
        <Grid container spacing={4} justifyContent="center" mb={8}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ padding: 3 }}>
              <Typography variant="h6" mb={2}>Total Detections</Typography>
              <Typography variant="h5" color="primary">{total_motion_detections}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ padding: 3 }}>
              <Typography variant="h6" mb={2}>Peak Hours</Typography>
              <Typography variant="body1">{peak_hours.map(hour => `${hour}:00`).join(', ')}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ padding: 3 }}>
              <Typography variant="h6" mb={2}>Highest Activity</Typography>
              <Typography variant="body1">{day_with_highest_motion.date}</Typography>
              <Typography variant="h5" color="primary">{day_with_highest_motion.count} detections</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ padding: 3 }}>
              <Typography variant="h6" mb={2}>Lowest Activity</Typography>
              <Typography variant="body1">{day_with_lowest_motion.date}</Typography>
              <Typography variant="h5" color="primary">{day_with_lowest_motion.count} detections</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Line Chart */}
        <Box mb={10}>
          <Typography variant="h6" align="center" gutterBottom>
            Motion Detection Pattern (Last 7 Days)
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 1]} ticks={[0, 1]} />
              <Tooltip />
              <Legend />
              {formattedData.length > 0 &&
                Object.keys(formattedData[0])
                  .filter((key) => key !== "date")
                  .map((hour, index) => (
                    <Line
                      key={index}
                      type="monotone"
                      dataKey={hour}
                      stroke={`hsl(${(index * 360) / 24}, 100%, 50%)`}
                      dot={false}
                      strokeWidth={2}
                    />
                  ))}
              <Brush />
              <ReferenceLine y={0.5} label="Motion Threshold" stroke="gray" strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Heatmap */}
        <Box>
          <Typography variant="h6" align="center" gutterBottom>
            Motion Detection Heatmap (Hourly Overview)
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={heatmapData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              {heatmapData.map((day, index) => (
                <Bar key={index} dataKey="motionDetected" stackId="a" barSize={10}>
                  {day.hours.map((hour, hourIndex) => (
                    <Cell
                      key={hourIndex}
                      fill={getBarColor(hour.motionDetected)}
                      width={30}
                    />
                  ))}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Container>
  );
};

export default MotionChart;
