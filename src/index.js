import dotenv from "dotenv";
import express from "express";
import Redis from "ioredis";

dotenv.config();

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL);

const QUEUE_KEY = "queue:email";

app.post("/email", async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    const Job = await redis.lpush(QUEUE_KEY, JSON.stringify(to, subject, body));
    res.status(200).json({ success: true, Job });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

app.get("/email", async (req, res) => {
  try {
    const jobData = await redis.rpop(QUEUE_KEY);
    const Job = await JSON.parse(jobData);
    res.status(200).json({ success: true, Job });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`server is ruining port ${PORT}`);
});
