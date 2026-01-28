// Utility to decode JWT and extract user info
export const decodeToken = () => {
  const token = localStorage.getItem("token");
  
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const decoded = JSON.parse(jsonPayload);
    console.log("Decoded Token:", decoded); // For debugging
    return decoded;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

export const isAdmin = () => {
  const decoded = decodeToken();
  if (!decoded) return false;
  
  // Check if authorities array exists and contains ROLE_ADMIN
  if (decoded.authorities && Array.isArray(decoded.authorities)) {
    return decoded.authorities.includes("ROLE_ADMIN");
  }
  
  return false;
};

export const getUserRole = () => {
  const decoded = decodeToken();
  if (!decoded || !decoded.authorities) return null;
  
  if (Array.isArray(decoded.authorities) && decoded.authorities.length > 0) {
    return decoded.authorities[0];
  }
  
  return null;
};

export const isLoggedIn = () => {
  return !!localStorage.getItem("token");
};

export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};
