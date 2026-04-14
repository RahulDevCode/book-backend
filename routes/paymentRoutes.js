import express from "express";
import crypto from "crypto";
import axios from "axios";

const router = express.Router();

// ⚡ PhonePe Sandbox Credentials
const merchantId = "PGTESTPAYUAT86"; 
const saltKey = "96434309-7796-489d-8924-ab56988a6076"; 
const saltIndex = 1;

// 🔹 Payment initiate route
router.post("/initiate", async (req, res) => {
  try {
    const { fullName, address, phone, amount } = req.body;

    // Order ID
    const merchantTransactionId = "TXN" + Date.now();

    const payload = {
      merchantId,
      merchantTransactionId,
      merchantUserId: "MUID" + Date.now(),
      amount: amount * 100, // in paise
      redirectUrl: "http://localhost:5000/api/payment/callback",
      redirectMode: "POST",
      mobileNumber: phone,
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");

    // Generate X-VERIFY Header
    const stringToHash = payloadBase64 + "/pg/v1/pay" + saltKey;
    const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const checksum = sha256 + "###" + saltIndex;

    const response = await axios.post(
      "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",
      { request: payloadBase64 },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "accept": "application/json"
        }
      }
    );

    console.log("📩 PhonePe Response:", response.data);

    return res.json({
      success: true,
      paymentUrl: response.data.data.instrumentResponse.redirectInfo.url
    });

  } catch (error) {
    console.error("PhonePe Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Payment initiation failed" });
  }
});

// 🔹 Callback route (after payment)
router.post("/callback", (req, res) => {
  console.log("📩 PhonePe Callback:", req.body);
  // yaha order status DB me save kar
  res.send("✅ Payment callback received!");
});

export default router;
