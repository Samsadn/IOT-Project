import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";
import Dashboard from "./Dashboard"; // Import the Dashboard component
import Charts from "./Charts"; // Import Charts component
import Login from "./Login"; // Import Login component

const App = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Open the menu
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close the menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Login logic
  const handleLogin = (username, hashedPassword) => {
    const correctUsername = "admin";
    const correctPasswordHash = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8";

    console.log("Provided hash:", hashedPassword);

    if (username === correctUsername && hashedPassword === correctPasswordHash) {
      setIsAuthenticated(true);
      return true; // Return success
    } else {
      console.log("Incorrect credentials");
      return false; // Return failure
    }
  };


  // Logout logic
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
      <Router>
        {isAuthenticated ? (
            <>
              {/* AppBar for authenticated users */}
              <AppBar
                  position="static"
                  style={{
                    background: "linear-gradient(90deg,  #8b5aed, #78ebfc)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  }}
              >
                <Toolbar>
                  <IconButton
                      edge="start"
                      color="inherit"
                      aria-label="menu"
                      onClick={handleMenuClick}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Smart Home Dashboard
                  </Typography>
                  <Button color="inherit" component={Link} to="/">
                    Dashboard
                  </Button>
                  <Button color="inherit" component={Link} to="/charts">
                    Charts
                  </Button>
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
                  <Button color="inherit" onClick={handleLogout}>
                    Logout
                  </Button>
                </Toolbar>
              </AppBar>

              {/* Routes for authenticated users */}
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/charts" element={<Charts />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </>
        ) : (
            <>
              {/* Redirect unauthenticated users to Login */}
              <Routes>
                <Route
                    path="*"
                    element={<Login onLogin={handleLogin} />}
                />
              </Routes>
            </>
        )}
      </Router>
  );
};

export default App;
