import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN || 'http://localhost:4000';

export default function Chat() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [roomLastMessages, setRoomLastMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    
    socket.current = io(SOCKET_URL);
    
    socket.current.on('connect', () => {
      console.log('Socket connected');
    });
    
    socket.current.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    socket.current.on('newMessage', (message) => {
      console.log('New message received:', message);
      setMessages(prev => {
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
      
      // Update room order when new message arrives
      setRooms(prev => {
        const updatedRooms = [...prev];
        const roomIndex = updatedRooms.findIndex(room => room.id === message.room_id);
        if (roomIndex !== -1) {
          const room = updatedRooms[roomIndex];
          updatedRooms.splice(roomIndex, 1);
          updatedRooms.unshift({ 
            ...room, 
            lastMessage: message,
            last_message_time: message.created_at 
          });
        }
        return updatedRooms;
      });
      
      // Only scroll to bottom if user is already at the bottom
      if (isUserAtBottom()) {
        scrollToBottom();
      }
    });
    
    socket.current.on('userTyping', (data) => {
      if (data.isTyping) {
        setTypingUsers(prev => [...prev.filter(u => u !== data.username), data.username]);
      } else {
        setTypingUsers(prev => prev.filter(u => u !== data.username));
      }
    });
    
    socket.current.on('chatError', (error) => {
      console.error('Chat error:', error);
      alert(error.message || 'เกิดข้อผิดพลาดในแชท');
    });
    
    loadRooms();
    
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [user]);

  const loadRooms = async (targetRoomId = null) => {
    try {
      setLoading(true);
      // Use accessible rooms endpoint to include winner chat rooms
      const { data } = await api.get('/chat/rooms/accessible');
      
      // Load last message for each room
      const roomsWithLastMessages = await Promise.all(
        data.map(async (room) => {
          try {
            const { data: messages } = await api.get(`/chat/rooms/${room.id}/messages?limit=1`);
            return {
              ...room,
              lastMessage: messages[0] || null
            };
          } catch (error) {
            return { ...room, lastMessage: null };
          }
        })
      );
      
      // Sort rooms by last message time (most recent first)
      const sortedRooms = roomsWithLastMessages.sort((a, b) => {
        const aTime = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
        const bTime = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
        return bTime - aTime;
      });
      
      setRooms(sortedRooms);
      
      // If targetRoomId is specified, select it after loading
      if (targetRoomId) {
        const targetRoom = sortedRooms.find(r => r.id === targetRoomId);
        if (targetRoom) {
          console.log(`Auto-selecting target room: ${targetRoomId} - "${targetRoom.name}"`);
          setSelectedRoom(targetRoom);
          setMessages([]);
          loadMessages(targetRoom.id);
          if (socket.current) {
            socket.current.emit('joinChatRoom', targetRoom.id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle room selection from URL parameter
  useEffect(() => {
    const roomIdParam = searchParams.get('room');
    if (roomIdParam) {
      const roomId = parseInt(roomIdParam);
      
      // If rooms are loaded, try to find the room
      if (rooms.length > 0) {
        const roomToSelect = rooms.find(r => r.id === roomId);
        if (roomToSelect) {
          // Only select if not already selected or different room
          if (!selectedRoom || selectedRoom.id !== roomId) {
            console.log(`Selecting room from URL parameter: ${roomId} - "${roomToSelect.name}"`);
            setSelectedRoom(roomToSelect);
            setMessages([]);
            loadMessages(roomToSelect.id);
            if (socket.current) {
              socket.current.emit('joinChatRoom', roomToSelect.id);
            }
          }
          // Clear the query parameter after selecting
          setSearchParams({}, { replace: true });
        } else {
          // Room not found in loaded rooms, reload rooms with target room ID
          console.log(`Room ${roomId} not found in loaded rooms, reloading with target...`);
          loadRooms(roomId);
        }
      } else if (!loading) {
        // Rooms not loaded yet, load them with target room ID
        loadRooms(roomId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, searchParams, loading]);

  const loadMessages = async (roomId) => {
    try {
      const { data } = await api.get(`/chat/rooms/${roomId}/messages`);
      setMessages(data);
      // Don't auto-scroll when loading messages for a new room
      // Let user stay at their current position
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const createRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    
    try {
      const { data } = await api.post('/chat/rooms', {
        name: newRoomName.trim(),
        description: newRoomDesc.trim()
      });
      setRooms(prev => [...prev, data]);
      setNewRoomName('');
      setNewRoomDesc('');
      setShowCreateRoom(false);
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('ไม่สามารถสร้างห้องแชทได้');
    }
  };

  const selectRoom = (room) => {
    setSelectedRoom(room);
    setMessages([]); // Clear messages first
    loadMessages(room.id);
    if (socket.current) {
      socket.current.emit('joinChatRoom', room.id);
    }
    // Clear query parameter when manually selecting room
    if (searchParams.get('room')) {
      setSearchParams({});
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      const { data } = await api.post(`/chat/rooms/${selectedRoom.id}/messages`, {
        content: newMessage.trim()
      });
      
      // Message will be received via socket 'newMessage' event
      // No need to emit 'sendMessage' as it's already handled by the API
      
      setNewMessage('');
      setIsTyping(false);
      
      if (socket.current) {
        socket.current.emit('stopTyping', selectedRoom.id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('ไม่สามารถส่งข้อความได้');
    }
  };

  const handleSendImage = async (e) => {
    e.preventDefault();
    if (!selectedImage || !selectedRoom) return;

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      
      const { data } = await api.post(`/chat/rooms/${selectedRoom.id}/messages/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (socket.current) {
        socket.current.emit('sendImageMessage', {
          roomId: selectedRoom.id,
          userId: user.id,
          imageUrl: data.image_url
        });
      }
      
      setSelectedImage(null);
      setImagePreview('');
    } catch (error) {
      console.error('Failed to send image:', error);
      alert('ไม่สามารถส่งรูปภาพได้');
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && selectedRoom) {
      setIsTyping(true);
      socket.current?.emit('typing', { 
        roomId: selectedRoom.id, 
        username: user.username, 
        isTyping: true 
      });
    }
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.current?.emit('typing', { 
        roomId: selectedRoom.id, 
        username: user.username, 
        isTyping: false 
      });
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isUserAtBottom = () => {
    const messagesContainer = document.querySelector('.chat-messages');
    if (!messagesContainer) return false;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
    return scrollHeight - scrollTop - clientHeight < 100; // 100px threshold
  };

  if (!user) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="container">
            <div className="text-center">
              <h1 className="page-title">💬 Chat Support</h1>
              <p className="page-subtitle">Connect with support and community</p>
            </div>
          </div>
        </div>
        <div className="page-content">
          <div className="container">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🔒</span>
                </div>
                <h2 className="text-2xl font-bold mb-4">Please Login</h2>
                <p className="text-gray-600">You need to login to use the chat system</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="container">
            <div className="text-center">
              <h1 className="page-title">💬 Chat Support</h1>
              <p className="page-subtitle">Connect with support and community</p>
            </div>
          </div>
        </div>
        <div className="page-content">
          <div className="container">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="loading">
                <div className="spinner"></div>
                <span>Loading chat...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Modern Header */}
      <div className="page-header">
        <div className="container">
          <div className="text-center">
            <h1 className="page-title">💬 Chat Support</h1>
            <p className="page-subtitle">Connect with support and community</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          {/* Modern Chat Container */}
          <div className="chat-container">
            {/* Modern Sidebar */}
            <div className="chat-sidebar">
              <div className="sidebar-header">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Chat Rooms</h3>
                  <button
                    onClick={() => setShowCreateRoom(!showCreateRoom)}
                    className="btn btn-primary btn-sm"
                  >
                    <span>➕</span>
                    <span>New Room</span>
                  </button>
                </div>
              </div>

              {/* Modern Create Room Form */}
              {showCreateRoom && (
                <div className="card mb-6">
                  <div className="card-content">
                    <h4 className="font-semibold text-gray-900 mb-4">Create New Room</h4>
                    <form onSubmit={createRoom} className="space-y-4">
                      <div className="form-group">
                        <label className="form-label">Room Name</label>
                        <input
                          type="text"
                          value={newRoomName}
                          onChange={(e) => setNewRoomName(e.target.value)}
                          className="form-input"
                          placeholder="Enter room name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Description</label>
                        <input
                          type="text"
                          value={newRoomDesc}
                          onChange={(e) => setNewRoomDesc(e.target.value)}
                          className="form-input"
                          placeholder="Room description (optional)"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button type="submit" className="btn btn-success flex-1">
                          <span>✨</span>
                          <span>Create</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCreateRoom(false)}
                          className="btn btn-secondary flex-1"
                        >
                          <span>❌</span>
                          <span>Cancel</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Modern Rooms List */}
              <div className="rooms-list">
                {rooms.map(room => (
                  <div
                    key={room.id}
                    className={`room-item ${selectedRoom?.id === room.id ? 'selected' : ''}`}
                    onClick={() => selectRoom(room)}
                  >
                    <div className="room-header">
                      <div className="room-name">{room.name || 'Chat Room'}</div>
                      {room.lastMessage && (
                        <div className="room-time">
                          {new Date(room.lastMessage.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                    </div>
                    <div className="room-description">
                      {room.lastMessage ? (
                        <div className="last-message">
                          <span className="last-message-sender">
                            {room.lastMessage.username}:
                          </span>
                          <span className="last-message-content">
                            {room.lastMessage.message || room.lastMessage.content || 'Sent an image'}
                          </span>
                        </div>
                      ) : (
                        room.description || 'No description'
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modern Main Chat Area */}
            <div className="chat-main">
              {selectedRoom ? (
                <>
                  {/* Modern Chat Header */}
                  <div className="chat-header">
                    <div className="chat-room-info">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg">💬</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {selectedRoom.name || 'Chat Room'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {selectedRoom.description || 'No description'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modern Messages */}
                  <div className="chat-messages">
                    {messages.map((message, index) => {
                      const isOwnMessage = message.user_id === user.id;
                      const prevMessage = index > 0 ? messages[index - 1] : null;
                      const showAvatar = !prevMessage || prevMessage.user_id !== message.user_id;
                      const showTimestamp = !prevMessage || 
                        new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 300000;
                      
                      const isLongMessage = message.message && message.message.length > 100;

                      return (
                        <div key={message.id} className={`chat-message ${isOwnMessage ? 'own-message' : 'other-message'}`}>
                          {!isOwnMessage && showAvatar && (
                            <div className="message-avatar">
                              <div className="avatar-circle">
                                {message.username.charAt(0).toUpperCase()}
                              </div>
                            </div>
                          )}
                          
                          <div className={`message-bubble ${isLongMessage ? 'long-message' : ''}`}>
                            {!isOwnMessage && showAvatar && (
                              <div className="message-username">{message.username}</div>
                            )}
                            
                            <div className="message-content">
                              {message.image_url ? (
                                <div className="message-image-container">
                                  <img 
                                    src={message.image_url.startsWith('http') ? message.image_url : `${BACKEND_ORIGIN}${message.image_url}`} 
                                    alt="Shared image"
                                    className="message-image"
                                    onClick={() => window.open(message.image_url.startsWith('http') ? message.image_url : `${BACKEND_ORIGIN}${message.image_url}`, '_blank')}
                                  />
                                  {message.message && (
                                    <div className="message-text">
                                      {message.message || message.content || 'No message content'}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="message-text">
                                  {message.message || message.content || 'No message content'}
                                </div>
                              )}
                            </div>
                            
                            {showTimestamp && (
                              <div className="message-timestamp">
                                {new Date(message.created_at).toLocaleString()}
                              </div>
                            )}
                          </div>
                          
                          {isOwnMessage && showAvatar && (
                            <div className="message-avatar">
                              <div className="avatar-circle own-avatar">
                                {message.username.charAt(0).toUpperCase()}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {typingUsers.length > 0 && (
                      <div className="typing-indicator">
                        <div className="typing-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <span className="typing-text">
                          {typingUsers.join(', ')} is typing...
                        </span>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Modern Chat Input */}
                  <div className="chat-input">
                    {imagePreview && (
                      <div className="image-preview-container">
                        <img src={imagePreview} alt="Preview" className="preview-image" />
                        <button
                          onClick={() => {
                            setImagePreview('');
                            setSelectedImage(null);
                          }}
                          className="preview-cancel-btn"
                        >
                          ✕
                        </button>
                        <div className="preview-info">
                          <div className="preview-text">Ready to send image</div>
                        </div>
                      </div>
                    )}
                    
                    <form onSubmit={selectedImage ? handleSendImage : handleSendMessage} className="input-form">
                      <div className="input-group">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={handleTyping}
                          placeholder="Type a message..."
                          className="message-input"
                          disabled={!!selectedImage}
                        />
                        <div className="input-actions">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="action-btn"
                            title="Send image"
                          >
                            📷
                          </button>
                          <button
                            type="submit"
                            className="send-btn"
                            disabled={!newMessage.trim() && !selectedImage}
                          >
                            {selectedImage ? 'Send Image' : 'Send'}
                          </button>
                        </div>
                      </div>
                    </form>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                  </div>
                </>
              ) : (
                <div className="chat-empty-state">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">💬</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Chat Room</h3>
                  <p className="text-gray-600">
                    Choose a chat room from the list on the left to start a conversation
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}