import { useEffect, useState } from "react";

export default function Home() {
  const [pi, setPi] = useState(null);
  const [status, setStatus] = useState("🔄 Đang kiểm tra Pi SDK...");
  const [error, setError] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        window.Pi &&
        typeof window.Pi.init === "function" &&
        typeof window.Pi.createPayment === "function"
      ) {
        try {
          window.Pi.init({ version: "2.0", sandbox: false });
          setPi(window.Pi);
          setStatus("✅ Pi SDK đã sẵn sàng (Mainnet).");
        } catch (err) {
          console.error("❌ Init Pi SDK lỗi:", err);
          setStatus("❌ Không khởi tạo Pi SDK.");
        } finally {
          clearInterval(interval);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handlePayment = async () => {
    setError(null);

    if (!pi) {
      setError("❌ Pi SDK chưa sẵn sàng. Mở trong Pi Browser (Mainnet).");
      return;
    }

    try {
      const payment = await pi.createPayment({
        amount: 1,
        memo: "Arena Pi Mainnet Payment",
        metadata: { arena: true },
        onReadyForServerApproval: async (paymentId) => {
          console.log("🔁 Approving payment:", paymentId);
          const res = await fetch(
            "https://arena-pi.onrender.com/api/payment/approve",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId }),
            }
          );
          const data = await res.json();
          console.log("✅ Approve response:", data);
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          console.log("🔁 Completing payment:", paymentId, txid);
          const res = await fetch(
            "https://arena-pi.onrender.com/api/payment/complete",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, txid }),
            }
          );
          const data = await res.json();
          console.log("✅ Complete response:", data);
        },
        onCancel: (paymentId) => console.warn("❌ Thanh toán bị huỷ:", paymentId),
        onError: (err, paymentId) => {
          console.error("❌ Lỗi trong quá trình thanh toán:", err, paymentId);
          setError("❌ Thanh toán không thành công.");
        },
      });

      console.log("💰 Payment created:", payment);
    } catch (err) {
      console.error("❌ Tạo payment lỗi:", err);
      setError("❌ Không thể tạo payment. Kiểm tra kết nối hoặc SDK.");
    }
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>🏟 Arena Pi Payment Test (Mainnet)</h1>
      <p>{status}</p>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button
        onClick={handlePayment}
        disabled={!pi}
        style={{
          padding: "10px 20px",
          backgroundColor: pi ? "#ff9900" : "#888",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: pi ? "pointer" : "not-allowed",
        }}
      >
        💰 Thanh toán Pi Thật
      </button>
    </main>
  );
}
