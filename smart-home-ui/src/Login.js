import React, { useState } from "react";
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
} from "@mui/material";
import crypto from "crypto-js";

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const hashedPassword = crypto.SHA256(password).toString();
        console.log("Submitting username:", username);
        console.log("Submitting hashed password:", hashedPassword);

        const success = await onLogin(username, hashedPassword);
        console.log("Login success:", success);
        if (!success) {
            setError("Invalid credentials. Please try again.");
        } else {
            setError(""); // Clear error on successful login
        }
    };

    return (
        <Container maxWidth="xs">
            <Paper elevation={3} style={{ padding: "20px", marginTop: "50px" }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Login
                </Typography>
                {error && (
                    <Alert severity="error" style={{ marginBottom: "20px" }}>
                        {error}
                    </Alert>
                )}
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Username"
                        fullWidth
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Box mt={2}>
                        <Button type="submit" fullWidth variant="contained" color="primary">
                            Login
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default Login;