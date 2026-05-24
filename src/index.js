import dotenv from "dotenv";
import express from "express";
import Redis from "ioredis";

dotenv.config();

const app = express();
app.use(express.json());

const redist = new Redis("redis://localhost:6379");

const BANNER_KEY = "app:banner";

app.post("/banner", async (req, res) => {
  const { bannerData } = req.body;
  await redist.set(BANNER_KEY, bannerData);
  res.json({ succes: true });
});

app.get("/banner", async (req, res) => {
  const message = await redist.get(BANNER_KEY);
  res.json({ message });
});

app.delete("/banner", async (req, res) => {
  const message = await redist.del(BANNER_KEY);
  res.json({ message });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`server is runing port ${PORT}`);
});
