import dotenv from "dotenv";
import express from "express";
import Redis from "ioredis";

dotenv.config();

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL);

app.post("/user/:id/hash", async (req, res) => {
  try {
    const userId = req.params.id;
    await redis.hset(userId, req.body);
    res.status(200).json({ message: "user data uplaod succes" });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

app.get("/user/:id/hash", async (req, res) => {
  try {
    const userId = req.params.id;
    const profile = await redis.hgetall(userId);
    res.status(200).json(profile);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`server is runing port ${PORT}`);
});
