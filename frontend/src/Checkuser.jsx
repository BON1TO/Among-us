// src/CheckUser.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Modern home / landing page for the college branch chatroom.
 * - Big hero with title + subtitle
 * - Login / Register CTAs
 * - Compact email check (keeps your server-based check-email flow)
 *
 * Drop this file in place of your old CheckUser.jsx
 */
export default function CheckUser() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleCheck = async () => {
    if (!email) {
      setError('Please enter your college email');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/auth/check-email`, {
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
    } catch (err) {
      setError('Server error. Try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const goLogin = () => navigate('/login');
  const goRegister = () => navigate('/register');

  return (
    <>
      <style>{`
        :root{
          --bg1: linear-gradient(120deg, #0f1724 0%, #001e3c 50%, #052c54 100%);
          --accent: #7c3aed;
          --accent-2: #00a3ff;
          --muted: #9aa3ad;
          --card-bg: linear-gradient(180deg,#ffffffcc,#f8fbffcc);
        }
        *{box-sizing:border-box}
        html,body,#root{height:100%;margin:0}
        body{
          font-family: Inter, 'Segoe UI', Roboto, system-ui, -apple-system, "Helvetica Neue", Arial;
          background: var(--bg1);
          color: #0b1824;
          -webkit-font-smoothing:antialiased;
          -moz-osx-font-smoothing:grayscale;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:36px;
        }

        .hero {
          width:100%;
          max-width:1200px;
          display:grid;
          grid-template-columns: 1fr 420px;
          gap:32px;
          align-items:center;
        }

        .left {
          color: white;
          padding:32px 36px;
        }
        .eyebrow {
          display:inline-flex;
          align-items:center;
          gap:10px;
          background: rgba(255,255,255,0.06);
          border-radius:999px;
          padding:8px 12px;
          color: #cfe9ff;
          font-weight:600;
          margin-bottom:18px;
          font-size:14px;
        }
        .title {
          font-size:44px;
          line-height:1.02;
          font-weight:800;
          letter-spacing:-0.6px;
          margin:10px 0 14px;
          color: #fff;
        }
        .subtitle {
          color: #dbeafe;
          font-size:18px;
          max-width:720px;
          margin-bottom:22px;
        }

        .features {
          display:flex;
          gap:12px;
          margin-top:22px;
          flex-wrap:wrap;
        }
        .feature {
          background: rgba(255,255,255,0.06);
          padding:10px 14px;
          border-radius:12px;
          color:#e6f4ff;
          font-weight:600;
          font-size:14px;
          display:inline-flex;
          gap:10px;
          align-items:center;
        }

        /* right card */
        .card {
          background: var(--card-bg);
          border-radius:16px;
          padding:22px;
          box-shadow: 0 10px 30px rgba(2,6,23,0.6);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.06);
        }

        .card h3 {
          margin:0 0 10px;
          font-size:20px;
          color:#06263b;
        }
        .card p {
          margin:0 0 18px;
          color: #264653;
          font-size:14px;
        }

        .cta-row {
          display:flex;
          gap:12px;
          margin-bottom:14px;
        }
        .btn {
          flex:1;
          padding:12px 14px;
          border-radius:12px;
          border: none;
          cursor:pointer;
          font-weight:700;
          font-size:15px;
          transition:transform .12s ease, box-shadow .12s ease;
        }
        .btn:active{ transform: translateY(1px) }
        .btn-primary {
          background: linear-gradient(90deg, var(--accent), #3b82f6);
          color: white;
          box-shadow: 0 8px 22px rgba(124,58,237,0.18);
        }
        .btn-outline {
          background: transparent;
          border: 2px solid rgba(6, 35, 51, 0.06);
          color: #06263b;
        }

        .or {
          text-align:center;
          margin:10px 0 16px;
          color: var(--muted);
          font-size:13px;
        }

        .email-row {
          display:flex;
          gap:10px;
          margin-bottom:6px;
        }
        .email-row input {
          flex:1;
          padding:12px 14px;
          border-radius:10px;
          border:1px solid rgba(2,6,23,0.06);
          font-size:15px;
          outline:none;
        }
        .email-row .go {
          padding:12px 16px;
          border-radius:10px;
          border:none;
          background: linear-gradient(90deg,#06b6d4,#3b82f6);
          color:white;
          font-weight:700;
        }

        .small-note {
          margin-top:8px;
          font-size:13px;
          color:#225e7a;
        }

        .legal {
          margin-top:18px;
          color:#1b3b4b;
          font-size:13px;
        }

        /* responsive */
        @media (max-width: 980px) {
          .hero { grid-template-columns: 1fr; padding:8px; gap:18px; max-width:920px; }
          .left { padding:18px 12px; }
        }
      `}</style>

      <div className="hero" role="main" aria-labelledby="hero-title">
        <div className="left">
          <div className="eyebrow">Student Branch Chat • Campus-Only</div>

          <h1 id="hero-title" className="title">
            Branch Chatroom — Connect, Study & Share
          </h1>

          <p className="subtitle">
            A simple, secure branch chatroom for Thapar College students only.
            Organize links, ask doubts, share notes, or form quick study groups — all grouped by your college branch.
            Please sign in with your college email to get started.
          </p>

          <div className="features" aria-hidden>
            <div className="feature">Real-time chat (Socket.IO)</div>
            <div className="feature">Presence & typing indicators</div>
            <div className="feature">Delivery & read receipts</div>
            <div className="feature">Branch-grouped rooms</div>
          </div>
        </div>

        <aside className="card" aria-label="Authentication card">
          <h3>Join your branch</h3>
          <p>
            This chatroom is exclusive to college students. Use your
            <strong> @thapar.edu</strong> email to sign in or register.
          </p>

          <div className="cta-row" role="group" aria-label="Login or register">
            <button className="btn btn-primary" onClick={goLogin}>Login</button>
            <button className="btn btn-outline" onClick={goRegister}>Register</button>
          </div>

          <div className="or">— or continue with your college email —</div>

          <div className="email-row" role="search" aria-label="Check email">
            <input
              aria-label="College email"
              placeholder="you@thapar.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCheck(); }}
            />
            <button
              className="go"
              onClick={handleCheck}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? 'Checking…' : 'Continue'}
            </button>
          </div>

          {error && <div style={{ color: '#7a1220', marginTop: 8, fontWeight: 700 }}>{error}</div>}

          <div className="small-note">
            If you don't yet have a college account or the check fails, use <strong>Register</strong>.
          </div>

          <div className="legal">
            By using this chatroom you agree to follow college communication guidelines.
          </div>
        </aside>
      </div>
    </>
  );
}
