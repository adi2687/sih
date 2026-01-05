import express from "express";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT2;
const app = express();

app.get("/", (req, res) => {
  console.log("on server 2");
  res.json({ success: true, msg: "on server 2" });
});

app.get("/health", (req, res) => {
  setTimeout(() => {
    return res.status(200).send("ok");
  }, 15000);
});

app.get("/test", (req, res) => {});
app.listen(PORT, () => {
  console.log(` http://localhost:${PORT}`);
});
