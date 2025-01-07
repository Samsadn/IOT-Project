import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";
import Dashboard from "./Dashboard"; // Import the Dashboard component
import Charts from "./Charts"; // Import Charts component

const App = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  // Open the menu
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close the menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Router>
      {/* Custom AppBar */}
      <AppBar
        position="static"
        style={{
          background: "linear-gradient(90deg, #1976D2, #388E3C)",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        }}
      >
        <Toolbar>
          {/* Menu Icon for Dropdown */}
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuClick}>
            <MenuIcon />
          </IconButton>
          
          {/* Title */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Smart Home Dashboard
          </Typography>

          {/* Topbar Navigation */}
          <Button color="inherit" component={Link} to="/">
            Dashboard
          </Button>
          <Button color="inherit" component={Link} to="/charts">
            Charts
          </Button>

          {/* Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose} component={Link} to="/">
              Dashboard
            </MenuItem>
            <MenuItem onClick={handleMenuClose} component={Link} to="/charts">
              Charts
            </MenuItem>
          </Menu>

          {/* Optional Login Button */}
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/charts" element={<Charts />} />
      </Routes>
    </Router>
  );
};

export default App;
