const express = require("express");
const router = express.Router();
const axios = require("axios");
const { validatePayment } = require("../utils/auth");

const PI_API = "https://api.minepi.com";

router.post("/approve", async (req, res) => {
  try {
    const { paymentId } = req.body;
    await validatePayment(paymentId);

    const response = await axios.post(`${PI_API}/v2/payments/${paymentId}/approve`, {}, {
      headers: { Authorization: `Key ${process.env.PI_API_KEY}` }
    });

    res.json({ success: true, data: response.data });
  } catch (err) {
    console.error("❌ Lỗi approve:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/complete", async (req, res) => {
  try {
    const { paymentId, txid } = req.body;

    const response = await axios.post(`${PI_API}/v2/payments/${paymentId}/complete`, { txid }, {
      headers: { Authorization: `Key ${process.env.PI_API_KEY}` }
    });

    res.json({ success: true, data: response.data });
  } catch (err) {
    console.error("❌ Lỗi complete:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
