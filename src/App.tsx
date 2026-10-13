
import { useEffect, useState } from "react";
import "./index.css";

export default function App() {
  const [amount, setAmount] = useState(1);
  const [fromCur, setFromCur] = useState("EUR");
  const [toCur, setToCur] = useState("USD");
  const [converted, setConverted] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function convert() {
      if (fromCur === toCur) {
        setConverted(amount);
        setError("");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const res = await fetch(
          `https://api.frankfurter.dev/v1/latest?amount=${amount}&from=${fromCur}&to=${toCur}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch exchange rates");
        }

        const data = await res.json();

        if (!ignore) {
          setConverted(data.rates[toCur]);
        }
      } catch {
        if (!ignore) {
          setError("Unable to load exchange rates. Please try again.");
          setConverted("");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    convert();

    return () => {
      ignore = true;
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
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            disabled={isLoading}
          />

          <select
            aria-label="Currency to convert from"
            value={fromCur}
            onChange={(e) => setFromCur(e.target.value)}
            disabled={isLoading}
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
        disabled={isLoading}
        aria-label="Swap currencies"
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
          />

          <select
            aria-label="Currency to convert to"
            value={toCur}
            onChange={(e) => setToCur(e.target.value)}
            disabled={isLoading}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="CAD">CAD</option>
            <option value="INR">INR</option>
          </select>
        </div>
      </div>

      {isLoading && (
        <p className="currency-loading">Updating exchange rate...</p>
      )}

      {error && <p className="currency-error">{error}</p>}

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
