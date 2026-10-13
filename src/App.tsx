
import { useEffect, useState } from "react";
import "./index.css";

export default function App() {
  const [amount, setAmount] = useState("1");
  const [fromCur, setFromCur] = useState("EUR");
  const [toCur, setToCur] = useState("USD");
  const [converted, setConverted] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

useEffect(() => {
  let ignore = false;
  const controller = new AbortController();

  const numericAmount = Number(amount);

  if (amount.trim() === "" || !Number.isFinite(numericAmount) || numericAmount < 0) {
    setConverted("");
    setError("");
    setIsLoading(false);
    return;
  }

  if (fromCur === toCur) {
    setConverted(String(numericAmount));
    setError("");
    setIsLoading(false);
    return;
  }

  setConverted("");
  setIsLoading(true);
  setError("");

  const timer = setTimeout(async () => {
    try {
      const params = new URLSearchParams({
        amount: String(numericAmount),
        from: fromCur,
        to: toCur,
      });

      const response = await fetch(
        `https://api.frankfurter.dev/v1/latest?${params.toString()}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exchange rates");
      }

      const data = await response.json();
      const rate = data.rates?.[toCur];

      if (typeof rate !== "number") {
        throw new Error("Exchange rate is unavailable");
      }

      if (!ignore) {
        setConverted(String(rate));
      }
    } catch (err) {
      if (!ignore && err instanceof Error && err.name !== "AbortError") {
        setError("Unable to load exchange rates. Please try again.");
      }
    } finally {
      if (!ignore) {
        setIsLoading(false);
      }
    }
  }, 500);

  return () => {
    ignore = true;
    clearTimeout(timer);
    controller.abort();
  };
}, [amount, fromCur, toCur]);

  function handleSwap() {
    setFromCur(toCur);
    setToCur(fromCur);
  }

  return (
    <main className="currency-app">
      <header className="currency-header">
        <div className="currency-icon">💱</div>

        <h1>Currency Converter</h1>

        <p className="currency-subtitle">
          Convert currencies with the latest available exchange rates.
        </p>
      </header>

      <div className="currency-field">
        <label htmlFor="amount">Amount</label>

        <div className="currency-controls">
          <input
            id="amount"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-label="Amount to convert"
          />

          <select
            aria-label="Currency to convert from"
            value={fromCur}
            onChange={(e) => setFromCur(e.target.value)}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="CAD">CAD</option>
            <option value="INR">INR</option>
          </select>
        </div>
      </div>

      <button
        className="swap-button"
        type="button"
        onClick={handleSwap}
        aria-label="Swap currencies"
        disabled={isLoading}
      >
        ⇅
      </button>

      <div className="currency-field">
        <label htmlFor="converted">Converted amount</label>

        <div className="currency-controls">
          <input
            id="converted"
            type="text"
            readOnly
            value={
              converted === ""
                ? ""
                : Number(converted).toLocaleString("en-US", {
                    maximumFractionDigits: 4,
                  })
            }
            placeholder="Result"
            aria-live="polite"
          />

          <select
            aria-label="Currency to convert to"
            value={toCur}
            onChange={(e) => setToCur(e.target.value)}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="CAD">CAD</option>
            <option value="INR">INR</option>
          </select>
        </div>
      </div>

      {isLoading && (
        <p className="currency-loading" role="status">
          Updating exchange rate...
        </p>
      )}

      {error && (
        <p className="currency-error" role="alert">
          {error}
        </p>
      )}

      {!isLoading && !error && converted !== "" && (
        <section className="converted-result">
          <p className="result-label">Converted amount</p>

          <p className="result-value">
            {Number(converted).toLocaleString("en-US", {
              maximumFractionDigits: 4,
            })}
            <span className="result-currency">{toCur}</span>
          </p>

          <p className="exchange-note">
            Rates provided by the Frankfurter API.
          </p>
        </section>
      )}

      <footer className="currency-footer">
        Currency Converter · React + Vite
      </footer>
    </main>
  );
}
