import React, { useState } from "react";
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Avatar,
    Grid,
    CssBaseline,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(username, password);
    };

    return (
        <Grid
            container
            component="main"
            sx={{
                height: "100vh",
                backgroundImage: "url('https://source.unsplash.com/random/1600x900?nature')",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
                background: "linear-gradient(to bottom,  #8b5aed, #78ebfc)", // Light gradient
            }}
        >
            <CssBaseline />
            <Container
                component="div"
                maxWidth="xs"
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        padding: 4,
                        borderRadius: 2,
                        textAlign: "center",
                        maxWidth: 400,
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                    }}
                >
                    <Avatar
                        sx={{
                            margin: "0 auto",
                            backgroundColor: "primary.main",
                        }}
                    >
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography variant="h5" sx={{ mt: 2, mb: 3 }}>
                        Login
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Username"
                            fullWidth
                            margin="normal"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            InputLabelProps={{
                                shrink: true, // Force the label to stay above the field
                              }}
                            variant="outlined"
                        />
                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputLabelProps={{
                                shrink: true, // Force the label to stay above the field
                              }}
                            variant="outlined"
                        />
                        <Box mt={3}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                sx={{
                                    padding: 1,
                                    textTransform: "uppercase",
                                    fontWeight: "bold",
                                    boxShadow: "0 3px 5px rgba(0, 0, 0, 0.2)",
                                }}
                            >
                                Login
                            </Button>
                        </Box>
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ mt: 3 }}
                        >
                            Don't have an account? <a href="#">Sign up</a>
                        </Typography>
                    </form>
                </Paper>
            </Container>
        </Grid>
    );
};

export default Login;
