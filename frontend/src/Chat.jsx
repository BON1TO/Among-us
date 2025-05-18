import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5000';

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socketRef = useRef();
  const branch = localStorage.getItem('branch');
  const username = localStorage.getItem('name');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch(`http://localhost:5000/api/messages/${branch}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error("Failed to load chat history", err));

    socketRef.current = io(SOCKET_SERVER_URL);
    socketRef.current.emit('joinBranch', branch);

    socketRef.current.on('chatMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [navigate, branch]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const sendMessage = () => {
    if (input.trim() === '') return;
    socketRef.current.emit('chatMessage', { branch, message: input, user: username });
    setInput('');
  };

  return (
    <>
      <style>{`
        html, body, #root {
          height: 100%;
          margin: 0;
          background: #f0f4f8;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .chat-container {
          width: 700px;
          height: 85vh;
          background: white;
          border-radius: 16px;
          box-shadow: 0 14px 45px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          padding: 40px 45px;
          box-sizing: border-box;
        }
        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .chat-header h2 {
          font-size: 2.8rem;
          color: #004d99;
          user-select: none;
          margin: 0;
        }
        .logout-button {
          background-color: #e74c3c;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          font-size: 1.4rem;
          cursor: pointer;
          transition: background-color 0.3s ease;
          user-select: none;
        }
        .logout-button:hover {
          background-color: #c0392b;
        }
        .chat-box {
          flex-grow: 1;
          border: 2px solid #0077cc;
          border-radius: 16px;
          padding: 25px 30px;
          overflow-y: auto;
          background: #f9fcff;
          margin-bottom: 30px;
          box-sizing: border-box;
          font-size: 1.6rem;
          color: #222;
          user-select: text;
        }
        .no-messages {
          color: #999;
          font-style: italic;
          text-align: center;
          margin-top: 20px;
        }
        .message {
          margin-bottom: 18px;
          max-width: 70%;
          padding: 14px 20px;
          border-radius: 22px;
          font-weight: 500;
          line-height: 1.3;
          word-wrap: break-word;
          position: relative;
        }
        .message strong {
          display: block;
          font-weight: 700;
          margin-bottom: 6px;
          user-select: none;
        }
        .message .time {
          font-size: 1.1rem;
          color: #666;
          margin-top: 8px;
          user-select: none;
        }
        .my-message {
          background-color: #d1e7dd;
          margin-left: auto;
          border-radius: 22px 22px 0 22px;
          text-align: right;
        }
        .other-message {
          background-color: #f1f0f0;
          border-radius: 22px 22px 22px 0;
          text-align: left;
        }
        .input-area {
          display: flex;
          gap: 12px;
        }
        .input-area input {
          flex-grow: 1;
          padding: 18px 20px;
          font-size: 1.6rem;
          border: 2px solid #0077cc;
          border-radius: 16px 0 0 16px;
          outline-offset: 3px;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          box-sizing: border-box;
        }
        .input-area input:focus {
          border-color: #004d99;
          box-shadow: 0 0 15px #66b2ff;
        }
        .send-button {
          background-color: #0077cc;
          border: none;
          padding: 18px 28px;
          border-radius: 0 16px 16px 0;
          color: white;
          font-size: 1.6rem;
          font-weight: 700;
          cursor: pointer;
          user-select: none;
          box-shadow: 0 8px 20px rgba(0, 119, 204, 0.5);
          transition: background-color 0.3s ease;
        }
        .send-button:hover {
          background-color: #004d99;
        }

        @media (max-width: 750px) {
          .chat-container {
            width: 90vw;
            height: 90vh;
            padding: 30px 20px;
          }
          .chat-header h2 {
            font-size: 2.2rem;
          }
          .logout-button {
            padding: 10px 20px;
            font-size: 1.2rem;
          }
          .chat-box {
            font-size: 1.4rem;
            padding: 20px 25px;
          }
          .input-area input, .send-button {
            font-size: 1.4rem;
            padding: 14px 18px;
          }
        }
      `}</style>

      <div className="chat-container">
        <header className="chat-header">
          <h2>Branch Chat: {branch}</h2>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </header>

        <div className="chat-box" tabIndex="0" aria-label="Chat messages">
          {messages.length === 0 && <p className="no-messages">No messages yet.</p>}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`message ${msg.user === username ? 'my-message' : 'other-message'}`}
            >
              <strong>{msg.user}</strong>: {msg.message}
              <div className="time">{new Date(msg.time).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>

        <div className="input-area">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
            aria-label="Message input"
          />
          <button onClick={sendMessage} className="send-button">Send</button>
        </div>
      </div>
    </>
  );
}
