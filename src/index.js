import dotenv from "dotenv";
import express from "express";
import Redis from "ioredis";
import { emailQueue } from "./queue.js";

dotenv.config();

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL);

const QUEUE_KEY = "queue:email";

app.post("/email", async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    const job = await emailQueue.add(
      "email",
      {
        to,
        subject,
        body,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      },
    );
    res.status(200).json({ success: true, jobId: job.id });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`server is ruining port ${PORT}`);
});
