import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('branch', data.user.branch);
        localStorage.setItem('name', data.user.name);
        alert('Login successful!');
        navigate('/chat');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Server error');
    }
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
        .login-container {
          width: 520px;
          padding: 60px 50px 60px 50px;
          border: 3px solid #0077cc;
          border-radius: 16px;
          background: linear-gradient(135deg, #e0f7fa, #ffffff);
          box-shadow: 0 12px 30px rgba(0, 119, 204, 0.25);
          box-sizing: border-box;
        }
        .login-heading {
          text-align: center;
          margin-bottom: 48px;
          font-size: 3.2rem;
          color: #004d99;
          font-weight: 700;
          letter-spacing: 1.3px;
        }
        .login-input {
          display: block;
          width: 100%;
          padding: 20px 18px;
          margin-bottom: 32px;
          border-radius: 12px;
          border: 2.5px solid #0077cc;
          font-size: 1.6rem;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          outline-offset: 3px;
          box-sizing: border-box;
        }
        .login-input:focus {
          border-color: #004d99;
          box-shadow: 0 0 12px #66b2ff;
        }
        .login-button {
          width: 100%;
          padding: 22px;
          background-color: #0077cc;
          color: #fff;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          font-size: 1.8rem;
          font-weight: 700;
          text-transform: uppercase;
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 8px 22px rgba(0, 119, 204, 0.45);
          user-select: none;
        }
        .login-button:hover {
          background-color: #004d99;
          box-shadow: 0 10px 30px rgba(0, 77, 153, 0.7);
        }
        .login-error {
          color: #cc3300;
          margin-top: 28px;
          font-size: 1.4rem;
          font-weight: 700;
          text-align: center;
          user-select: none;
        }
        @media (max-width: 600px) {
          html, body, #root {
            font-size: 14px;
          }
          .login-container {
            width: 90vw;
            padding: 40px 30px 40px 30px;
          }
          .login-heading {
            font-size: 2.4rem;
            margin-bottom: 36px;
          }
          .login-input {
            font-size: 1.4rem;
            padding: 18px 14px;
            margin-bottom: 24px;
          }
          .login-button {
            font-size: 1.5rem;
            padding: 18px;
          }
          .login-error {
            font-size: 1.2rem;
            margin-top: 20px;
          }
        }
      `}</style>

      <div className="login-container">
        <h2 className="login-heading">Login</h2>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        <button onClick={handleLogin} className="login-button">
          Login
        </button>
        {error && <p className="login-error">{error}</p>}
      </div>
    </>
  );
}
