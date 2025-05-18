import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', branch: '' });
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('branch', data.user.branch);
        localStorage.setItem('name', data.user.name);
        alert('Registered successfully! Please login.');
        navigate('/login');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Server error');
    }
  };

  const styles = {
    container: {
      maxWidth: 450,
      padding: '40px 35px',
      borderRadius: 12,
      backgroundColor: '#fff',
      border: '2px solid #007bff',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.5), 0 6px 6px rgba(0, 0, 0, 0.3)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },

    heading: {
      fontSize: '2.8rem',
      fontWeight: '700',
      marginBottom: 35,
      textAlign: 'center',
      color: '#222',
      letterSpacing: '1px',
      userSelect: 'none',
    },
    input: {
      width: '100%',
      padding: '18px 22px',
      marginBottom: 22,
      fontSize: '20px',
      fontWeight: '600',
      borderRadius: 8,
      border: '2px solid #ddd',
      backgroundColor: '#fff',
      color: '#222',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      userSelect: 'text',
    },
    inputFocus: {
      borderColor: '#007bff',
      boxShadow: '0 0 6px #007bff',
    },
    button: {
      width: '100%',
      padding: '16px 0',
      fontSize: '22px',
      fontWeight: '700',
      color: '#fff',
      backgroundColor: '#007bff',
      border: 'none',
      borderRadius: 10,
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      userSelect: 'none',
      boxShadow: '0 6px 16px rgba(0,123,255,0.5)',
    },
    error: {
      marginTop: 18,
      textAlign: 'center',
      color: '#dc3545',
      fontWeight: '700',
      fontSize: '16px',
      userSelect: 'none',
    },
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f2f5', // optional: subtle background for contrast
      }}
    >
      <div style={styles.container}>
        <h2 style={styles.heading}>Register</h2>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          style={{
            ...styles.input,
            ...(focusedInput === 'name' ? styles.inputFocus : {}),
          }}
          onFocus={() => setFocusedInput('name')}
          onBlur={() => setFocusedInput(null)}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={{
            ...styles.input,
            ...(focusedInput === 'email' ? styles.inputFocus : {}),
          }}
          onFocus={() => setFocusedInput('email')}
          onBlur={() => setFocusedInput(null)}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={{
            ...styles.input,
            ...(focusedInput === 'password' ? styles.inputFocus : {}),
          }}
          onFocus={() => setFocusedInput('password')}
          onBlur={() => setFocusedInput(null)}
        />
        <input
          name="branch"
          placeholder="Branch (e.g. Computer Science)"
          value={form.branch}
          onChange={handleChange}
          style={{
            ...styles.input,
            ...(focusedInput === 'branch' ? styles.inputFocus : {}),
          }}
          onFocus={() => setFocusedInput('branch')}
          onBlur={() => setFocusedInput(null)}
        />
        <button onClick={handleRegister} style={styles.button}>
          Register
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}
