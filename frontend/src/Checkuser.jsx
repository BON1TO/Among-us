import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CheckUser() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCheck = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.registered) {
          navigate('/login', { state: { email } });
        } else {
          navigate('/register', { state: { email } });
        }
      } else {
        setError(data.error || 'Error checking email');
      }
    } catch {
      setError('Server error');
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        html, body, #root {
          height: 100%;
          margin: 0;
          font-size: 16px;
          background: #f0f4f8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .check-container {
          width: 520px;
          padding: 60px 50px;
          border: 3px solid #0077cc;
          border-radius: 16px;
          background: linear-gradient(135deg, #e0f7fa, #ffffff);
          box-shadow: 0 12px 30px rgba(0, 119, 204, 0.25);
          box-sizing: border-box;
          text-align: center;
        }
        .check-heading {
          font-size: 3rem;
          color: #004d99;
          margin-bottom: 48px;
          font-weight: 700;
          letter-spacing: 1.3px;
          user-select: none;
        }
        .check-input {
          width: 100%;
          padding: 20px 18px;
          margin-bottom: 32px;
          border-radius: 12px;
          border: 2.5px solid #0077cc;
          font-size: 1.6rem;
          box-sizing: border-box;
          outline-offset: 3px;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .check-input:focus {
          border-color: #004d99;
          box-shadow: 0 0 12px #66b2ff;
        }
        .check-button {
          width: 100%;
          padding: 22px;
          background-color: #0077cc;
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 1.8rem;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 8px 22px rgba(0, 119, 204, 0.45);
          user-select: none;
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }
        .check-button:hover:not(:disabled) {
          background-color: #004d99;
          box-shadow: 0 10px 30px rgba(0, 77, 153, 0.7);
        }
        .check-button:disabled {
          background-color: #7baaf7;
          cursor: not-allowed;
          box-shadow: none;
        }
        .check-error {
          color: #cc3300;
          margin-top: 28px;
          font-size: 1.4rem;
          font-weight: 700;
          user-select: none;
        }
        @media (max-width: 600px) {
          html, body, #root {
            font-size: 14px;
          }
          .check-container {
            width: 90vw;
            padding: 40px 30px;
          }
          .check-heading {
            font-size: 2.2rem;
            margin-bottom: 36px;
          }
          .check-input {
            font-size: 1.4rem;
            padding: 18px 14px;
            margin-bottom: 24px;
          }
          .check-button {
            font-size: 1.5rem;
            padding: 18px;
          }
          .check-error {
            font-size: 1.2rem;
            margin-top: 20px;
          }
        }
      `}</style>

      <div className="check-container">
        <h2 className="check-heading">Welcome! Enter your email to continue</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="check-input"
        />
        <button
          onClick={handleCheck}
          disabled={loading}
          className="check-button"
        >
          {loading ? 'Checking...' : 'Continue'}
        </button>
        {error && <p className="check-error">{error}</p>}
      </div>
    </>
  );
}
