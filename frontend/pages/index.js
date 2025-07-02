import { useEffect, useState } from "react";

export default function Home() {
  const [pi, setPi] = useState(null);
  const [status, setStatus] = useState("🔄 Đang khởi tạo Pi SDK...");
  const [error, setError] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (typeof window !== "undefined" && window.Pi?.init && window.Pi?.authenticate) {
        clearInterval(interval);
        try {
          window.Pi.init({ version: "2.0", sandbox: true });
          await window.Pi.authenticate(['payments'], console.log);
          setPi(window.Pi);
          setStatus("✅ Pi SDK & KHÔNG xác thực thành công.");
        } catch (e) {
          console.error(e);
          setStatus("❌ Lỗi khi init/auth Pi SDK.");
        }
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handlePayment = async () => {
    if (!pi) return setError("❌ Pi SDK chưa sẵn sàng.");
    setError(null);

    try {
      const payment = await pi.createPayment({
        amount: 1,
        memo: "Arena Test Pi",
        metadata: { app: "arena" },
        onReadyForServerApproval: paymentId => {
          fetch("https://arena-pi.onrender.com/api/payment/approve", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ paymentId }),
          }).then(r => r.json()).then(console.log).catch(console.error);
        },
        onReadyForServerCompletion: (paymentId, txid) => {
          fetch("https://arena-pi.onrender.com/api/payment/complete", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ paymentId, txid }),
          }).then(r => r.json()).then(console.log).catch(console.error);
        },
        onCancel: id => console.warn("Cancelled:", id),
        onError: (err, pmt) => console.error("Error payment:", err, pmt),
      });
      console.log("Payment UI:", payment);
    } catch (e) {
      console.error(e);
      setError("❌ Không thể tạo payment.");
    }
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Arena Pi Payment (Testnet)</h1>
      <p>{status}</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handlePayment} disabled={!pi}>
        💰 Thanh toán Test Pi
      </button>
    </main>
  );
}
