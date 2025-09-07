// src/socket.js
import { io } from 'socket.io-client';

const SERVER = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// export a single socket instance (autoConnect=false to control connect)
export const socket = io(SERVER, { autoConnect: false });
