import React, { useState } from "react";
import {
   Container,
   Paper,
   Typography,
   TextField,
   Button,
   Box,
} from "@mui/material";


//comment


const Login = ({ onLogin }) => {
   const [username, setUsername] = useState("");
   const [password, setPassword] = useState("");


   const handleSubmit = (e) => {
       e.preventDefault();
       onLogin(username, password);
   };


   return (
       <Container maxWidth="xs">
           <Paper elevation={3} style={{ padding: "20px", marginTop: "50px" }}>
               <Typography variant="h5" align="center" gutterBottom>
                   Login
               </Typography>
               <form onSubmit={handleSubmit}>
                   <TextField
                       label="Username"
                       fullWidth
                       margin="normal"
                       value={username}
                       onChange={(e) => setUsername(e.target.value)}
                   />
                   <TextField
                       label="Password"
                       type="password"
                       fullWidth
                       margin="normal"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
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
