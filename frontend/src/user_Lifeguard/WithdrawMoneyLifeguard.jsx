import React, { useState, useEffect } from "react";
import axios from "axios";
import LayoutLifeguard from "./LayoutLifeguard";
import "./WithdrawMoneyLifeguard.css";

const WithdrawMoneyLifeguard = () => {
  // Retrieve the lifeguard/worker ID from localStorage
  const workerId = localStorage.getItem("lifeguardId");
  
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [iban, setIban] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  /**
   * Fetch the current balance from the backend
   */
  const fetchBalance = async () => {
    try {
      setIsLoadingBalance(true);
      setError(""); // Clear any existing error
      if (!workerId) {
        throw new Error("Worker ID not found. Please log in again.");
      }

      // Make GET request to GetBalanceView
      const response = await axios.get(
        `http://127.0.0.1:8000/api/get_balance/?worker_id=${workerId}`
      );
      setBalance(response.data.balance);
    } catch (err) {
      console.error("Error fetching balance:", err);
      // If the backend provides an error message, display it
      setError(err.response?.data?.error || "Failed to fetch balance.");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  /**
   * Handle the Withdraw action
   */
  const handleWithdraw = async () => {
    // Basic client-side checks
    if (!amount || !iban) {
      setError("Please fill in all fields.");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (parseFloat(amount) > balance) {
      setError("Amount exceeds your current balance.");
      return;
    }
    // Simple IBAN pattern check; adjust as needed
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) {
      setError("Enter a valid IBAN.");
      return;
    }

    // Clear previous errors before proceeding
    setError("");
    setIsProcessing(true);

    try {
      // POST request to WithdrawMoneyWorkerView
      await axios.post("http://127.0.0.1:8000/api/withdraw_money_worker/", {
        worker_id: workerId,
        amount: parseFloat(amount),
      });

      alert(`Your withdrawal of ${amount} TL has been processed.`);

      // Clear form fields
      setAmount("");
      setIban("");

      // Refetch updated balance to show the new amount
      fetchBalance();
    } catch (err) {
      console.error("Withdrawal error:", err);
      setError(err.response?.data?.error || "An error occurred during withdrawal.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <LayoutLifeguard>
      <div className="withdraw-container">
        <h1 className="withdraw-heading">Withdraw Money</h1>

        <div className="balance-display">
          {isLoadingBalance ? (
            <p>Loading current balance...</p>
          ) : (
            <p>
              Your Current Balance: <span>{balance} TL</span>
            </p>
          )}
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
          disabled={isProcessing || isLoadingBalance}
        >
          {isProcessing ? "Processing..." : "Withdraw"}
        </button>
      </div>
    </LayoutLifeguard>
  );
};

export default WithdrawMoneyLifeguard;
