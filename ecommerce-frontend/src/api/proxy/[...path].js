export default async function handler(req, res) {
  const { path = [] } = req.query;
  const target = `http://yamabiko.proxy.rlwy.net:32838/api/${path.join("/")}`;

  const response = await fetch(target, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: req.headers.authorization || "",
    },
    body:
      req.method !== "GET" && req.method !== "HEAD"
        ? JSON.stringify(req.body)
        : undefined,
  });

  const data = await response.text();

  res.status(response.status).send(data);
}