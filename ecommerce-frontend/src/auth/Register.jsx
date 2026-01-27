 
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { authService } from "../api/services";

const Register = () => {
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");
  
  const handleRegister = async () => {

    if (!username || !password || !confirmPassword) {
      alert("All fields are required");
      return;
    }

    if(password !== confirmPassword){
      alert("Passwords do not match");
      return;
    }

    try{
      const response = await authService.register(username, password);
      alert(response.data.message);
      window.location.href = "/login";
    }
    catch (error) {
      const msg =error.response?.data?.message || "Registration failed. Check input values.";
      alert(msg);
    }
  }

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
          Register
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

        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleRegister}
        >
          Register
        </Button>
      </Container>
    </Box>
  );
};

export default Register;
