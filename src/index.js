import dotenv from "dotenv";
import express from "express";
import Redis from "ioredis";

dotenv.config();

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL);

function otpKey(phoneNum) {
  return `otp:${phoneNum}`;
}

app.post("/otp", async (req, res) => {
  try {
    const { phoneNum } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.set(otpKey(phoneNum), otp, "EX", 600);
    res.status(200).json({ message: `send OTP: ${otp}` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
});

app.post("/otp/verify", async (req, res) => {
  try {
    const { phoneNum, otp } = req.body;
    const saveOtp = await redis.get(otpKey(phoneNum));
    if (!saveOtp) {
      res.status(500).json({ message: "OTP is expriead" });
    }
    if (saveOtp !== otp) {
      res.status(500).json({ message: "Invilead OPT" });
    }

    await redis.del(otpKey(phoneNum));
    res.status(200).json({ message: "OTP Verify Succesfully" });
  } catch (error) {
    console.log(error);
  }
});

app.get("/otp/:phone/ttl", async (req, res) => {
  try {
    const phone = req.params.phone;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const ttl = await redis.ttl(phone);

    if (ttl === -2) {
      return res.status(404).json({
        success: false,
        message: "OTP not found or expired",
      });
    }

    if (ttl === -1) {
      return res.status(200).json({
        success: true,
        message: "OTP exists but has no expiration",
        ttl,
      });
    }

    return res.status(200).json({
      success: true,
      ttl,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`server is runing port ${PORT}`);
});
