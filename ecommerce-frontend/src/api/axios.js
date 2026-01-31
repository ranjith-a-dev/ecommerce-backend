import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        
        if(token)
            config.headers.Authorization = `Bearer ${token}`;

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) =>  {
        const status = error.response?.status;
        const message = error.response?.data?.message || "Something went wrong. Please ty again";

        if(status === 401){
            localStorage.removeItem("token");

            alert("Session expired. Please login again.");
            window.location.href = "/login";
        }

        if(status === 403) {
            console.error("403 Forbidden Error:", {
                url: error.config?.url,
                method: error.config?.method,
                status: status,
                message: message,
                fullError: error.response?.data
            });
        }
        
        console.error("API Error:", message);

        return Promise.reject(error);
    }
)

export default api;