export const decodeToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    return null;
  }
};

export const isTokenExpired = () => {
  const decoded = decodeToken();
  if (!decoded?.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
};

export const isLoggedIn = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  return !isTokenExpired();
};

export const isAdmin = () => {
  const decoded = decodeToken();
  if (!decoded) return false;

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

export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

export const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token || token === "null" || token === "undefined") return null;
  return token;
};

export const clearAuth = () => {
  localStorage.removeItem("token");
};

