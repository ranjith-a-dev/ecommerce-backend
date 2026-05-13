export default async function handler(req, res) {
  const { path = [] } = req.query;

  const backendUrl = `http://yamabiko.proxy.rlwy.net:32838/api/${path.join("/")}${req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : ""}`;

  try {
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        authorization: req.headers.authorization || "",
        "content-type": "application/json",
      },
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? JSON.stringify(req.body)
          : undefined,
    });

    const data = await response.text();

    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}