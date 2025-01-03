import React, { useState, useEffect } from "react";
import LayoutCoach from "./LayoutCoach"; // Ensure correct import
import "./WithdrawMoneyCoach.css";
import axios from "axios";

const WithdrawMoney = () => {
  const [balance, setBalance] = useState(1500); // Initialize balance
  const [amount, setAmount] = useState("");
  const [iban, setIban] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Fetch balance from the backend
    const fetchBalance = async () => {
      try {
        const workerId = localStorage.getItem("coachId"); // Ensure worker ID is stored
        if (!workerId) {
          setError("Worker ID not found. Please log in again.");
          return;
        }

        const response = await axios.get(
          `http://127.0.0.1:8000/api/get_balance/?worker_id=${workerId}`
        );

        setBalance(response.data.balance);
      } catch (err) {
        setError("Failed to fetch balance.");
        console.error(err);
      }
    };

    fetchBalance();
  }, []);

  const handleWithdraw = async () => {
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

    try {
      const workerId = localStorage.getItem("workerId"); // Retrieve worker ID
      const response = await axios.post(
        "http://127.0.0.1:8000/api/withdraw_money_worker/",
        { worker_id: workerId, amount }, // Request body
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Ensure cookies are sent
        }
      );

      if (response.status === 200) {
        alert("Withdrawal successful!");
        setBalance((prevBalance) => prevBalance - amount); // Update balance locally
        setAmount("");
        setIban("");
      } else {
        setError(response.data.error || "Failed to withdraw money.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <LayoutCoach>
      <div className="withdraw-container">
        <h1 className="withdraw-heading">Withdraw Money</h1>
        <div className="balance-display">
          <p>
            Your Current Balance: <span>{balance} TL</span>
          </p>
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
    </LayoutCoach>
  );
};

export default WithdrawMoney;
