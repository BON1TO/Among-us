// src/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

/**
 * Modern Login page matching CheckUser / Register visuals.
 * - Prefills email if passed via location.state
 * - Validates college email domain (@thapar.edu)
 * - Stores user data in localStorage on success and navigates to /chat
 */
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillEmail = location?.state?.email || '';

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const collegeDomain = '@thapar.edu';
  const isCollegeEmail = (e) => String(e).toLowerCase().endsWith(collegeDomain);

  useEffect(() => {
    if (prefillEmail) {
      const nameFromEmail = prefillEmail.split('@')[0].replace(/\./g, ' ');
      // optional: prefill branch or name elsewhere if desired
      // setBranch('Computer Science');
    }
  }, [prefillEmail]);

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setError('');

    if (!email) return setError('Please enter your college email.');
    if (!isCollegeEmail(email)) return setError(`Please use your college email (${collegeDomain}).`);
    if (!password) return setError('Please enter your password.');

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, branch }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || 'Login failed. Check credentials.');
        setLoading(false);
        return;
      }

      // expected: { userId, name, branch, token }
      localStorage.setItem('userId', data.userId || data.id || data._id || email);
      localStorage.setItem('name', data.name || email.split('@')[0]);
      localStorage.setItem('branch', data.branch || branch || 'CSE');
      localStorage.setItem('token', data.token || '');

      navigate('/chat');
    } catch (err) {
      console.error(err);
      setError('Network error. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        :root{
          --bg1: linear-gradient(120deg, #0f1724 0%, #001e3c 50%, #052c54 100%);
          --card-bg: linear-gradient(180deg,#ffffffcc,#f8fbffcc);
          --accent: #7c3aed;
          --muted: #9aa3ad;
        }
        *{box-sizing:border-box}
        html,body,#root{height:100%;margin:0}
        body{
          font-family: Inter, 'Segoe UI', Roboto, system-ui, -apple-system, "Helvetica Neue", Arial;
          background: var(--bg1);
          color: #0b1824;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:28px;
        }

        .wrap {
          width:100%;
          max-width:1100px;
          display:grid;
          grid-template-columns: 1fr 520px;
          gap:28px;
          align-items:start;
        }

        .leftCard {
          background: rgba(255,255,255,0.04);
          border-radius: 16px;
          padding: 28px;
          color: #f2fbff;
          box-shadow: 0 10px 40px rgba(2,6,23,0.6);
          border: 1px solid rgba(255,255,255,0.04);
        }
        .leftCard h1 {
          margin:0 0 8px;
          font-size:32px;
          line-height:1.02;
          letter-spacing:-0.3px;
        }
        .leftCard p { margin:0 0 18px; color:#dbeafe; max-width:720px; }

        .card {
          background: var(--card-bg);
          border-radius:16px;
          padding:20px;
          box-shadow: 0 10px 30px rgba(2,6,23,0.6);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.06);
        }

        form { display:flex; flex-direction:column; gap:12px; }
        label { font-weight:700; color:#0b1824; font-size:13px; margin-top:8px; }
        input[type="text"], input[type="email"], input[type="password"] {
          padding:12px 14px;
          border-radius:10px;
          border:1px solid rgba(2,6,23,0.06);
          font-size:15px;
          outline:none;
          box-sizing:border-box;
        }
        input:focus { box-shadow:0 8px 20px rgba(59,130,246,0.08); border-color:#3b82f6; }

        .row {
          display:flex;
          gap:12px;
        }
        .col { flex:1; }

        .submit {
          margin-top:10px;
          padding:12px 14px;
          border-radius:10px;
          border:none;
          background: linear-gradient(90deg,var(--accent),#3b82f6);
          color:white;
          font-weight:800;
          cursor:pointer;
          font-size:15px;
          box-shadow: 0 8px 22px rgba(124,58,237,0.16);
        }
        .small {
          font-size:13px;
          color:#0b1824;
          margin-top:6px;
        }
        .muted {
          color: #225e7a;
          font-size:13px;
        }
        .error {
          color:#7a1220;
          background:#feeceb;
          padding:10px;
          border-radius:8px;
          font-weight:700;
        }

        .sideNote {
          margin-top:18px;
          font-size:13px;
          color:#dbeafe;
        }

        @media (max-width: 980px) {
          .wrap { grid-template-columns: 1fr; padding:12px; }
        }
      `}</style>

      <div className="wrap" role="main">
        <div className="leftCard" aria-hidden>
          <h1>Welcome back</h1>
          <p>
            Sign in with your official <strong>@thapar.edu</strong> email to join your branch chatroom.
            If you don't have an account yet, click Register to create one — it's only available for college students.
          </p>

          <div className="sideNote">
            <strong>Tip:</strong> Use your branch field to join the correct room (e.g., Computer Science).
          </div>
        </div>

        <aside className="card" aria-label="Login card">
          <h3 style={{ margin: 0, marginBottom: 6 }}>Login</h3>
          <p style={{ margin: 0, marginBottom: 12, color: '#264653' }}>
            Enter your college email and password to continue.
          </p>

          <form onSubmit={onSubmit} aria-label="Login form">
            <label>College Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@thapar.edu"
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />

            <label>Branch (optional)</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="e.g., Computer Science"
            />

            {error && <div className="error" role="alert">{error}</div>}

            <button className="submit" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="small">Don't have an account?</div>
              <Link to="/register" style={{ fontWeight: 800, color: '#0b3b6b' }}>Register</Link>
            </div>
          </form>
        </aside>
      </div>
    </>
  );
}
