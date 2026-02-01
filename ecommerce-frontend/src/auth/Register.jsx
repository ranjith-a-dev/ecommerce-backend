import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Stack,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authService } from "../api/services";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const [loading, setLoading] = useState(false);

  const [msg, setMsg] = useState({
    text: "",
    type: "", // "error" | "success"
  });

  const handleRegister = async () => {
    setMsg({ text: "", type: "" });

    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setMsg({ text: "All fields are required", type: "error" });
      return;
    }

    if (password.length < 6) {
      setMsg({ text: "Password must be at least 6 characters", type: "error" });
      return;
    }

    if (password !== confirmPassword) {
      setMsg({ text: "Passwords do not match", type: "error" });
      return;
    }

    try {
      setLoading(true);

      await authService.register(username.trim(), password);

      setMsg({ text: "User registered successfully ✅", type: "success" });

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (error) {
      setMsg({
        text:
          error.response?.data?.message ||
          "Registration failed. Check input values.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 3, md: 6 },
        background: "linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            borderRadius: 4,
            border: "1px solid rgba(78,84,200,0.10)",
            boxShadow: "0 16px 60px rgba(78,84,200,0.10)",
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 900, letterSpacing: -0.6, color: "#4e54c8" }}
            >
              Register
            </Typography>

            <Stack spacing={2} sx={{ mt: 2.3 }}>
              <TextField
                label="Username"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                error={msg.type === "error"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineRoundedIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Password"
                type={showPass1 ? "text" : "password"}
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                error={msg.type === "error"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPass1((p) => !p)}
                        edge="end"
                      >
                        {showPass1 ? (
                          <VisibilityOffRoundedIcon />
                        ) : (
                          <VisibilityRoundedIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box>
                <TextField
                  label="Confirm Password"
                  type={showPass2 ? "text" : "password"}
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  error={msg.type === "error"}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRegister();
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPass2((p) => !p)}
                          edge="end"
                        >
                          {showPass2 ? (
                            <VisibilityOffRoundedIcon />
                          ) : (
                            <VisibilityRoundedIcon />
                          )}
                        </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

                {msg.text && (
                  <Typography
                    sx={{
                      mt: 0.8,
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: msg.type === "success" ? "#2e7d32" : "#d32f2f",
                    }}
                  >
                    {msg.text}
                  </Typography>
                )}
              </Box>

              <Button
                type="button"
                variant="contained"
                fullWidth
                onClick={handleRegister}
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <HowToRegRoundedIcon />
                  )
                }
                sx={{
                  py: 1.35,
                  borderRadius: 3,
                  fontWeight: 900,
                  textTransform: "none",
                  background:
                    "linear-gradient(90deg, #4e54c8 0%, #8f94fb 100%)",
                  boxShadow: "0 2px 10px rgba(78,84,200,0.16)",
                }}
              >
                {loading ? "Creating account..." : "Register"}
              </Button>

              <Typography
                variant="body2"
                sx={{ textAlign: "center", color: "#6b7280" }}
              >
                Already have an account?{" "}
                <Box
                  component="span"
                  onClick={() => navigate("/login")}
                  sx={{
                    color: "#4e54c8",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Login
                </Box>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
