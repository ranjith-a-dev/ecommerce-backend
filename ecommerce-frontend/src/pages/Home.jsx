/* eslint-disable no-unused-vars */
import api from "../api/axios";

const Home = () => {

  const testToken = async () => {
    try {
      const res = await api.get("/test/protected");
      alert(res.data);
    } catch (err) {
      console.log("Error caught in component");
    }
  };

  return (
    <div>
      <h1>Home</h1>
      <button onClick={testToken}>Test Protected API</button>
    </div>
  );
};

export default Home;
