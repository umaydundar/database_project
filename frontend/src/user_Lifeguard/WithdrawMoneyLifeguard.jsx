import React, { useState } from "react";
import LayoutLifeguard from "./LayoutLifeguard"; // Ensure correct import
import "./WithdrawMoneyLifeguard.css";

const WithdrawMoneyLifeguard = () => {
  const [balance, setBalance] = useState(1500); // Initial balance
  const [amount, setAmount] = useState("");
  const [iban, setIban] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleWithdraw = () => {
    if (!amount || !iban) {
      setError("Please fill in all fields.");
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    if (amount > balance) {
      setError("Amount exceeds your current balance.");
      return;
    }

    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) {
      setError("Enter a valid IBAN.");
      return;
    }

    setError("");
    setIsProcessing(true);

    setTimeout(() => {
      setBalance((prevBalance) => prevBalance - amount);
      setAmount("");
      setIban("");
      setIsProcessing(false);
      alert(`Your withdrawal of ${amount} TL has been processed.`);
    }, 2000); // Simulate processing time
  };

  return (
    <LayoutLifeguard>
      <div className="withdraw-container">
        <h1 className="withdraw-heading">Withdraw Money</h1>
        <div className="balance-display">
          <p>Your Current Balance: <span>{balance} TL</span></p>
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="amount">Amount to Withdraw:</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount in TL"
          />
        </div>
        <div className="form-group">
          <label htmlFor="iban">IBAN:</label>
          <input
            type="text"
            id="iban"
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            placeholder="Enter your IBAN"
          />
        </div>
        <button
          className={`withdraw-button ${isProcessing ? "processing" : ""}`}
          onClick={handleWithdraw}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Withdraw"}
        </button>
      </div>
    </LayoutLifeguard>
  );
};

export default WithdrawMoneyLifeguard;