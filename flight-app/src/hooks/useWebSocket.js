import { useEffect, useState } from 'react';
import websocketService from '../services/websocket';

function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [flightsData, setFlightsData] = useState([]);
  const [planesData, setPlanesData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  //const [highlightedEvent, setHighlightedEvent] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    websocketService.connect();
    websocketService.join('2063935J', 'clementestreeter');

    websocketService.on('open', () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
    });

    websocketService.on('flights', (data) => {
      console.log('Received flights data:', data);
      setFlightsData(data.flights);
    });

    websocketService.on('plane', (data) => {
      console.log('Received plane data:', data);
      setPlanesData((prevPlanes) => {
        const updatedPlanes = { ...prevPlanes };
        updatedPlanes[data.plane.flight_id] = data.plane;
        return updatedPlanes;
      });
    });

    websocketService.on('take-off', (data) => {
      console.log('Received take-off event:', data);
      setEventsData((prevEvents) => [...prevEvents, { type: 'take-off', position: [data.lat, data.long], flight_id: data.flight_id }]);
    });

    websocketService.on('landing', (data) => {
      console.log('Received landing event:', data);
      setEventsData((prevEvents) => [...prevEvents, { type: 'landing', position: [data.lat, data.long], flight_id: data.flight_id }]);
    });

    websocketService.on('crashed', (data) => {
      console.log('Received crashed event:', data);
      setEventsData((prevEvents) => [...prevEvents, { type: 'crashed', flight_id: data.flight_id }]);
    });

    websocketService.on('message', (data) => {
      console.log('Received message:', data);
      setMessages((prevMessages) => [...prevMessages, data.message]);
    });

    websocketService.on('close', (event) => {
      console.log('WebSocket connection closed1:', event.code, event.reason);
      setIsConnected(false);
      console.log(event.code, event.reason)
      if (event.code === 1006) { 
        console.log('Attempting to reconnect...');
        websocketService.connect();
      }
    });

    return () => {
      websocketService.disconnect();
      console.log('WebSocket connection close');
      setIsConnected(false);
      websocketService.eventListeners = {}; 
    };
  }, []);


  const join = (userId, username) => {
    websocketService.join(userId, username);
  };

  const sendMessage = (content) => {
    console.log('Sending message:', content);
    websocketService.sendMessage(content);
  };

  return {
    isConnected,
    flightsData,
    planesData,
    eventsData,
    //highlightedEvent,
    messages,
    join,
    sendMessage,
  };
}

export default useWebSocket;
