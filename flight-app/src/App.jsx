// /src/App.jsx

import { useEffect, useState, useRef } from 'react';
import './App.css';
import useWebSocket from './hooks/useWebSocket';
import MapView from './components/MapView';
import './Chat.css';

function App() {
  const { isConnected, flightsData, planesData, eventsData, messages, join, sendMessage } = useWebSocket();
  const [hasJoined, setHasJoined] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    if (isConnected && !hasJoined) {
      join('2063935J', 'clementestreeter');
      setHasJoined(true);
    }
  }, [isConnected, hasJoined, join]);

  const sortedFlights = flightsData ? Object.values(flightsData).sort((a, b) => {
    if (a.departure.name < b.departure.name) return -1;
    if (a.departure.name > b.departure.name) return 1;
    if (a.destination.name < b.destination.name) return -1;
    if (a.destination.name > b.destination.name) return 1;
    return 0;
  }) : [];

  return (
    <div className="app-container">
      <h1>Welcome to the Flight Tracker</h1>
      {isConnected ? <p>Connected to WebSocket server</p> : <p>Connecting...</p>}
      
      <div className="map-container">
        <MapView flightsData={flightsData} planesData={planesData} eventMarkers={eventsData} />
      </div>

      <div className="flights-table-container">
        <h2>Flights Information</h2>
        <table className="flights-table">
          <thead>
            <tr>
              <th>Flight ID</th>
              <th>Departure Airport</th>
              <th>Destination Airport</th>
              <th>Airline</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedFlights.map((flight) => {
              const plane = planesData[flight.id] || {};
              return (
                <tr key={flight.id}>
                  <td>{flight.id}</td>
                  <td>{flight.departure.name}</td>
                  <td>{flight.destination.name}</td>
                  <td>{plane.airline?.name || 'N/A'}</td>
                  <td>{plane.status || 'N/A'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="chat-container">
        <h2>Chat</h2>
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`chat-message ${message.level === 'warn' ? 'chat-message-warn' : (message.name === 'clementestreeter' ? 'chat-message-sent' : 'chat-message-received')}`}>
              <div className="chat-message-name">{message.name}:</div>
              <div className="chat-message-content">{message.content}</div>
              <div className="chat-message-timestamp">{new Date(message.date).toLocaleString()}</div>
            </div>
            
          ))}
          
          
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
          />
          <button onClick={() => {
            sendMessage(newMessage);
            setNewMessage('');
          }}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;


