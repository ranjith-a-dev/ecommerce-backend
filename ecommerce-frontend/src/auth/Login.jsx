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
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    setErrorMsg("");

    if (!username.trim() || !password.trim()) {
      setErrorMsg("Username and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await authService.login(username.trim(), password);
      localStorage.setItem("token", response.data.token);

      navigate("/", { replace: true });
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Invalid credentials");
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
              Login
            </Typography>

            <Stack spacing={2} sx={{ mt: 2.3 }}>
              <TextField
                label="Username"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                error={Boolean(errorMsg)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineRoundedIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <Box>
                <TextField
                  label="Password"
                  type={showPass ? "text" : "password"}
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  error={Boolean(errorMsg)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin();
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
                          onClick={() => setShowPass((p) => !p)}
                          edge="end"
                        >
                          {showPass ? (
                            <VisibilityOffRoundedIcon />
                          ) : (
                            <VisibilityRoundedIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {errorMsg && (
                  <Typography
                    sx={{
                      mt: 0.8,
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "#d32f2f",
                    }}
                  >
                    {errorMsg}
                  </Typography>
                )}
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={handleLogin}
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <LoginRoundedIcon />
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
                {loading ? "Signing in..." : "Login"}
              </Button>

              <Typography
                variant="body2"
                sx={{ textAlign: "center", color: "#6b7280" }}
              >
                Don’t have an account?{" "}
                <Box
                  component="span"
                  onClick={() => navigate("/register")}
                  sx={{
                    color: "#4e54c8",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Register
                </Box>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
