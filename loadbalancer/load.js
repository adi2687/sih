import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
const app = express();

const servers = [
  {
    url: "http://localhost:3001",
    connections: 0,
    healthy: true,
  },
  { url: "http://localhost:3002", connections: 0, healthy: true },
];

setInterval(async () => {
  for (const server of servers) {
    try {
      await fetch(server.url + "/health");
      if (server.healthy) {
        continue;
      }
      server.healthy = true;
    } catch (error) {
      server.healthy = false;
      console.error("is down", server);
    }
  }
}, 5000);

function getleast() {
  const healthy = servers.filter((s) => s.healthy);
  if (healthy.length === 0) return null;
  return healthy.reduce((min, server) =>
    server.connections < min.connections ? server : min
  );
}
app.use((req, res) => {
  const server = getleast();
  if (!server) {
    return res
      .status(503)
      .json({ success: false, msg: "no servers available" });
  }
  server.connections += 1;
  console.log(`routing to ${server.url} and all are`, JSON.stringify(servers));

  res.on("finish", () => {
    server.connections -= 1;
    console.log("finsihed", server.url, server.connections);
  });
  return createProxyMiddleware({
    target: server.url,
    changeOrigin: true,
  })(req, res);
});
app.listen(3000, () => {
  console.log("Load balancer running on port 3000");
});
