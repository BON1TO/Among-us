// src/Chat.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from './socket';

function prettifyName(raw) {
  if (!raw) return 'Unknown';
  // if object with name
  if (typeof raw === 'object' && raw.name) return String(raw.name);
  const s = String(raw);
  // if looks like email, use local part
  if (s.includes('@')) {
    const local = s.split('@')[0];
    // replace dots/underscores/hyphens with spaces and capitalize words
    return local
      .split(/[\._-]+/)
      .map(w => w ? (w.charAt(0).toUpperCase() + w.slice(1)) : '')
      .join(' ')
      .trim();
  }
  // fallback capitalize
  return s.replace(/[_\.-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function Chat() {
  const navigate = useNavigate();
  const branch = localStorage.getItem('branch') || 'General';
  const username = localStorage.getItem('name') || prettifyName(localStorage.getItem('userId') || '');
  const userId = localStorage.getItem('userId') || username;
  const token = localStorage.getItem('token');

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [busy, setBusy] = useState(false);

  const scrollRef = useRef(null);
  const typingTimerRef = useRef(null);

  // normalize message shape and ensure userName is friendly
  const normalize = (raw) => {
    if (!raw) return null;

    // if server sends nested user object
    if (raw.user && typeof raw.user === 'object') {
      return {
        _id: raw._id || raw.id || Math.random().toString(36).slice(2),
        userId: raw.user.id || raw.userId || raw.user._id || raw.user.email || Math.random().toString(36).slice(2),
        userName: prettifyName(raw.user.name || raw.user.username || raw.user.email || raw.user.id),
        text: raw.message ?? raw.text ?? '',
        status: raw.status ?? 'sent',
        createdAt: raw.createdAt ?? raw.time ?? new Date().toISOString()
      };
    }

    // if raw.user is a string (maybe an email)
    if (raw.user && typeof raw.user === 'string') {
      return {
        _id: raw._id || raw.id || Math.random().toString(36).slice(2),
        userId: raw.userId || raw.user || Math.random().toString(36).slice(2),
        userName: prettifyName(raw.user),
        text: raw.message ?? raw.text ?? '',
        status: raw.status ?? 'sent',
        createdAt: raw.createdAt ?? raw.time ?? new Date().toISOString()
      };
    }

    // fallback if server sends name fields differently
    const nameCandidate = raw.name || raw.username || raw.userName || raw.user_id || raw.userId;
    return {
      _id: raw._id || raw.id || Math.random().toString(36).slice(2),
      userId: raw.userId || raw.user || raw.from || Math.random().toString(36).slice(2),
      userName: prettifyName(nameCandidate),
      text: raw.message || raw.text || '',
      status: raw.status || 'sent',
      createdAt: raw.createdAt || raw.time || new Date().toISOString()
    };
  };

  // replace optimistic message or append
  const handleIncomingMessage = (m) => {
    setMessages(prev => {
      const tempIndex = prev.findIndex(pm =>
        String(pm._id).startsWith('temp-') &&
        String(pm.userId) === String(userId) &&
        pm.text === m.text &&
        (new Date() - new Date(pm.createdAt) < 20000)
      );

      if (tempIndex !== -1) {
        const copy = [...prev];
        copy[tempIndex] = m;
        return copy.filter((msg, idx) => idx === tempIndex || msg._id !== m._id);
      }
      if (prev.some(pm => pm._id === m._id)) return prev;
      return [...prev, m];
    });
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/messages/${branch}`)
      .then(res => res.json())
      .then(data => {
        const normalized = (Array.isArray(data) ? data : []).map(normalize);
        setMessages(normalized);
      })
      .catch(err => console.error('Failed to load history', err));

    socket.connect();

    socket.on('connect', () => {
      socket.emit('user:join', { userId, name: username });
      socket.emit('joinBranch', branch);
    });

    socket.off('message:new');
    socket.on('message:new', (raw) => {
      const m = normalize(raw);
      if (!m) return;
      handleIncomingMessage(m);
      socket.emit('message:ackDelivered', { messageId: m._id, userId });
      socket.emit('message:read', { messageId: m._id, userId });
    });

    socket.off('message:delivered');
    socket.on('message:delivered', ({ messageId }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, status: 'delivered' } : m));
    });

    socket.off('message:read');
    socket.on('message:read', ({ messageId }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, status: 'read' } : m));
    });

    socket.off('typing');
    socket.on('typing', ({ branch: b, userId: u, name }) => {
      if (b !== branch || u === userId) return;
      setTypingUsers(prev => ({ ...prev, [u]: prettifyName(name || u) }));
    });

    socket.off('stopTyping');
    socket.on('stopTyping', ({ branch: b, userId: u }) => {
      if (b !== branch) return;
      setTypingUsers(prev => {
        const copy = { ...prev };
        delete copy[u];
        return copy;
      });
    });

    socket.off('user:online');
    socket.on('user:online', ({ userId: uid, name }) => {
      setOnlineUsers(prev => ({ ...prev, [uid]: { name: prettifyName(name || uid), lastSeen: null } }));
    });

    socket.off('user:offline');
    socket.on('user:offline', ({ userId: uid }) => {
      setOnlineUsers(prev => {
        const copy = { ...prev };
        delete copy[uid];
        return copy;
      });
    });

    socket.off('chatMessage');
    socket.on('chatMessage', (raw) => {
      const m = normalize(raw);
      if (!m) return;
      handleIncomingMessage(m);
      socket.emit('message:ackDelivered', { messageId: m._id, userId });
      socket.emit('message:read', { messageId: m._id, userId });
    });

    return () => {
      socket.off('connect');
      socket.off('message:new');
      socket.off('message:delivered');
      socket.off('message:read');
      socket.off('typing');
      socket.off('stopTyping');
      socket.off('user:online');
      socket.off('user:offline');
      socket.off('chatMessage');
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch, navigate, userId, username, token]);

  const logout = () => {
    socket.disconnect();
    localStorage.clear();
    navigate('/login');
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    setBusy(true);
    const tempId = 'temp-' + Date.now();
    const optimistic = {
      _id: tempId,
      userId,
      userName: username,
      text: input,
      status: 'sent',
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimistic]);
    socket.emit('message:send', { branch, text: input, userId, name: username, tempId });
    setInput('');
    setBusy(false);
  };

  const onInputChange = (e) => {
    setInput(e.target.value);
    socket.emit('typing', { branch, userId, name: username });

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit('stopTyping', { branch, userId });
    }, 800);
  };

  const renderTick = (status) => {
    if (status === 'read') return <span className="tick double">✓✓</span>;
    if (status === 'delivered') return <span className="tick single">✓</span>;
    return <span className="tick pending">…</span>;
  };

  const renderAvatar = (name) => {
    const display = prettifyName(name || '');
    const initials = String(display).split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() || 'U';
    const colorSeed = (display || '').charCodeAt(0) || 65;
    const bg = `hsl(${colorSeed % 360} 60% 45%)`;
    return (
      <div className="avatar" style={{ background: bg }}>
        {initials}
      </div>
    );
  };

  // auto-scroll when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight + 200;
    }
  }, [messages]);

  return (
    <>
      <style>{`
        /* (kept compact styling similar to your white-card version) */
        :root { --bg: linear-gradient(120deg,#061826 0%, #082a44 60%, #07355a 100%); --muted:#6b7785; }
        *{box-sizing:border-box} html,body,#root{height:100%;margin:0}
        body{font-family:Inter, 'Segoe UI', Roboto, system-ui; background:var(--bg); color:#e8f4ff; display:flex; align-items:center; justify-content:center; padding:18px;}

        .container{ width:100%; max-width:1100px; display:grid; grid-template-columns:220px 1fr 220px; gap:14px; align-items:start; }

        .side,.panel{ border-radius:10px; padding:12px; background: rgba(255,255,255,0.02); min-height:64vh; border:1px solid rgba(255,255,255,0.03); }

        .chat-card{ background:linear-gradient(180deg,#ffffff04,#ffffff02); border-radius:10px; min-height:64vh; display:flex; flex-direction:column; border:1px solid rgba(255,255,255,0.03); overflow:hidden; }
        .chat-header{ display:flex; align-items:center; gap:10px; padding:10px 12px; border-bottom:1px solid rgba(255,255,255,0.02); }
        .chat-header h3{ margin:0; font-size:16px; color:#eaf4ff; }
        .chat-body{ padding:10px; flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:6px; background:transparent; }

        .message-row{ display:flex; gap:8px; align-items:flex-end; }
        .message-row.self{ justify-content:flex-end; }

        .card-msg{ display:flex; flex-direction:column; background:#ffffff; color:#042024; max-width:78%; border-radius:10px; padding:8px 10px; box-shadow:0 6px 18px rgba(2,6,23,0.08); word-break:break-word; line-height:1.2; font-size:14px; }
        .card-msg .author{ font-weight:700; font-size:13px; margin-bottom:4px; color:#023642; }
        .card-msg .text{ white-space:pre-wrap; }
        .card-msg .meta{ display:flex; gap:8px; align-items:center; margin-top:6px; font-size:11px; color:var(--muted); }

        .avatar{ width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:700; color:white; font-size:13px; flex-shrink:0; }

        .chat-footer{ padding:10px; border-top:1px solid rgba(255,255,255,0.02); display:flex; gap:8px; align-items:center; background: rgba(255,255,255,0.01); }
        .input{ flex:1; display:flex; gap:8px; align-items:center; background: rgba(255,255,255,0.02); padding:6px 8px; border-radius:10px; }
        .input input{ flex:1; background:transparent; border:0; outline:none; padding:8px; color:inherit; font-size:14px; }
        .send-btn{ padding:8px 12px; border-radius:8px; border:none; background:linear-gradient(90deg,#06b6d4,#3b82f6); color:white; font-weight:800; cursor:pointer; }

        .typing{ font-style:italic; color:var(--muted); font-size:13px; margin-left:6px; }

        .tick{ margin-left:8px; font-size:12px; opacity:0.9; }
        .tick.double{ color:#0ea5a4; font-weight:800; }
        .tick.single{ color:#94a3b8; font-weight:800; }
        .tick.pending{ color:#94a3b8; font-weight:700; opacity:0.5; }

        @media (max-width:980px){ .container{ grid-template-columns:1fr; padding:10px; } .side,.panel{ display:none; } .card-msg{ max-width:92%; } }
      `}</style>

      <div className="container" role="main">
        <aside className="side" aria-label="Branch info">
          <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8 }}>
            <div style={{ width:36, height:36, borderRadius:8, background:'linear-gradient(90deg,#7c3aed,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#fff' }}>
              {branch.slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:800 }}>{branch}</div>
              <div style={{ color:'var(--muted)', fontSize:12 }}>Campus Branch Chat</div>
            </div>
          </div>

          <div style={{ color:'var(--muted)', fontSize:13, marginTop:6 }}>
            A private chatspace for classmates: study, share and discuss.
          </div>

          <div style={{ marginTop:12 }}>
            <div style={{ fontWeight:700, marginBottom:8, color:'#eaf4ff' }}>Online</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {Object.keys(onlineUsers).length === 0 && <div style={{ color:'var(--muted)' }}>No users online</div>}
              {Object.entries(onlineUsers).map(([uid, info]) => (
                <div key={uid} style={{ display:'flex', gap:8, alignItems:'center', padding:6, borderRadius:8, background:'rgba(255,255,255,0.01)' }}>
                  <div className="avatar" style={{ background:'#0b72a6' }}>{(info.name || uid).slice(0,1).toUpperCase()}</div>
                  <div style={{ fontSize:13, color:'#eaf4ff', fontWeight:700 }}>{info.name || uid}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="chat-card" aria-label="Chat area">
          <div className="chat-header">
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div className="avatar" style={{ background:'#064e6e' }}>{branch.slice(0,2).toUpperCase()}</div>
              <div>
                <div style={{ fontSize:16, fontWeight:800 }}>{branch} • Branch Chat</div>
                <div style={{ fontSize:12, color:'var(--muted)' }}>{Object.keys(onlineUsers).length} online</div>
              </div>
            </div>

            <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
              <button onClick={() => { navigator.clipboard?.writeText(window.location.href); }} title="Copy link" style={{ background:'transparent', border:'none', color:'var(--muted)', cursor:'pointer' }}>Share</button>
              <button onClick={logout} title="Logout" style={{ background:'transparent', border:'none', color:'var(--muted)', cursor:'pointer' }}>Logout</button>
            </div>
          </div>

          <div className="chat-body" ref={scrollRef} role="log" aria-live="polite">
            {messages.length === 0 && <div style={{ color:'var(--muted)' }}>No messages yet — say hi 👋</div>}

            {messages.map((m) => {
              const isMine = String(m.userId) === String(userId) || String(m.userName) === String(username);
              return (
                <div key={m._id} className={`message-row ${isMine ? 'self' : 'other'}`}>
                  {!isMine && renderAvatar(m.userName)}
                  <div className="card-msg" style={isMine ? { alignItems: 'flex-end' } : undefined}>
                    <div className="author">{m.userName}</div>
                    <div className="text">{m.text}</div>
                    <div className="meta">
                      <div>{new Date(m.createdAt).toLocaleTimeString()}</div>
                      {isMine && renderTick(m.status)}
                    </div>
                  </div>
                  {isMine && renderAvatar(m.userName)}
                </div>
              );
            })}

            {Object.keys(typingUsers).length > 0 && (
              <div style={{ marginTop:6, fontStyle:'italic', color:'var(--muted)', fontSize:13 }}>
                {Object.values(typingUsers).slice(0,3).join(', ')} {Object.values(typingUsers).length === 1 ? 'is' : 'are'} typing...
              </div>
            )}
          </div>

          <div className="chat-footer">
            <div className="input" role="search">
              <input
                aria-label="Type a message"
                placeholder="Type a message..."
                value={input}
                onChange={onInputChange}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
              />
              <button className="send-btn" onClick={sendMessage} aria-disabled={busy}>Send</button>
            </div>
          </div>
        </section>

        <aside className="panel" aria-label="Chat panel">
          <h4 style={{ marginTop:0, color:'#eaf4ff' }}>About this room</h4>
          <p style={{ color:'var(--muted)' }}>Only college students may join. Keep discussions respectful and avoid sharing sensitive information.</p>

          <h4 style={{ marginTop:12, color:'#eaf4ff' }}>Quick actions</h4>
          <p style={{ color:'var(--muted)' }}>
            • Copy room link to invite classmates.<br/>
            • Use your branch field on login/register to join this room.
          </p>
        </aside>
      </div>
    </>
  );
}
