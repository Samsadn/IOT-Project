import React, { useEffect, useState } from "react";
import axios from "axios";
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

  // Fetch motion data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/fetch-motion-data");
        setMotionData(response.data);
      } catch (error) {
        console.error("Error fetching motion data:", error);
      }
    };
    fetchData();
  }, []);

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

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ color: "#333", textAlign: "center" }}>Motion Detection Overview</h2>

      {/* LineChart for Motion Detection Pattern */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ textAlign: "center", fontWeight: "bold", marginBottom: "20px" }}>
          Motion Detection Pattern (Last 7 Days)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 1]} ticks={[0, 1]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "5px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)"
              }}
              labelStyle={{
                fontWeight: "bold",
                color: "#333"
              }}
            />
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
                    activeDot={{ r: 8 }}
                    isAnimationActive={true}
                    strokeWidth={2}
                  />
                ))}
            <Brush />
            {/* Optional: Add a reference line for comparison */}
            <ReferenceLine y={0.5} label="Motion Threshold" stroke="gray" strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap-like BarChart for Motion Detection */}
      <div>
        <h3 style={{ textAlign: "center", fontWeight: "bold", marginBottom: "20px" }}>
          Motion Detection Heatmap (Hourly Overview)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={heatmapData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "5px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)"
              }}
              labelStyle={{
                fontWeight: "bold",
                color: "#333"
              }}
            />
            <Legend />
            {heatmapData.map((day, index) => (
              <Bar key={index} dataKey="motionDetected" stackId="a" barSize={10}>
                {day.hours.map((hour, hourIndex) => (
                  <Cell
                    key={hourIndex}
                    fill={getBarColor(hour.motionDetected)}
                    width={30} // Adjust bar width for a clearer view
                  />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MotionChart;
