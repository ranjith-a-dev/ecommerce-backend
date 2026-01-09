/* eslint-disable no-unused-vars */
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useState } from "react";
import api from "../api/axios";

const Login = () => {
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");

  const handleLogin = async () => {
    try{
      const response = await api.post("/auth/login",{username,password});

      localStorage.setItem("token",response.data.token);
      alert("Login successful");
      window.location.href = "/";
    }
    catch(error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 64px)", 
      }}
    >
      <Container maxWidth="xs">
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>

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

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleLogin}
        >
          Login
        </Button>
      </Container>
    </Box>
  );
};

export default Login;
