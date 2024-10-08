import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import departureImage from '../assets/icons8-despegue-24.png';
import landingImage from '../assets/icons8-aterrizaje-24.png';
import planeImage from '../assets/icons8-avion-24.png';
import ambulanceImage from '../assets/icons8-ambulancia-30.png';


const departureIcon = new L.Icon({
  iconUrl: departureImage,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const destinationIcon = new L.Icon({
  iconUrl: landingImage,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const planeIcon = new L.Icon({
  iconUrl: planeImage,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

const ambulanceIcon = new L.Icon({
  iconUrl: ambulanceImage,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

function MapView({ flightsData, planesData, eventMarkers }) {
  const [flightRoutes, setFlightRoutes] = useState({});
  const [airportMarkers, setAirportMarkers] = useState({});
  const [visiblePlanes, setVisiblePlanes] = useState({});
  //const [crashedPlanes, setCrashedPlanes] = useState({});

  useEffect(() => {
    const newFlightRoutes = {};
    const newAirportMarkers = {};
    const newVisiblePlanes = {};

    
    if (flightsData) {
      Object.keys(flightsData).forEach((flightId) => {
        const flight = flightsData[flightId];
        const departureKey = `${flight.departure.location.lat}-${flight.departure.location.long}`;
        const destinationKey = `${flight.destination.location.lat}-${flight.destination.location.long}`;

       
        if (!newAirportMarkers[departureKey]) {
          newAirportMarkers[departureKey] = {
            position: [flight.departure.location.lat, flight.departure.location.long],
            icon: departureIcon,
            name: flight.departure.name,
            city: flight.departure.city.name,
            country: flight.departure.city.country.name,
          };
        }

        
        if (!newAirportMarkers[destinationKey]) {
          newAirportMarkers[destinationKey] = {
            position: [flight.destination.location.lat, flight.destination.location.long],
            icon: destinationIcon,
            name: flight.destination.name,
            city: flight.destination.city.name,
            country: flight.destination.city.country.name,
          };
        }

       
        if (!flightRoutes[flightId] || flightRoutes[flightId].status !== 'landed') {
          newFlightRoutes[flightId] = {
            positions: [
              [flight.departure.location.lat, flight.departure.location.long],
              [flight.destination.location.lat, flight.destination.location.long],
            ],
            color: planesData[flightId]?.status === 'take-off' ? 'red' : 'blue', 
            weight: planesData[flightId]?.status === 'take-off' ? 6 : 3, 
            status: planesData[flightId]?.status || 'in-progress', 
          };
        } else {
          newFlightRoutes[flightId] = flightRoutes[flightId];
        }

        if (planesData[flightId]) {
          newVisiblePlanes[flightId] = planesData[flightId];
        }
      });
    }

    setFlightRoutes(newFlightRoutes);
    setAirportMarkers(newAirportMarkers);
    setVisiblePlanes(newVisiblePlanes);
  }, [flightsData, planesData]);

  
  

  useEffect(() => {
    if (eventMarkers) {
      eventMarkers.forEach((event) => {
        if (event.type === 'landing') {
          setFlightRoutes((prevFlightRoutes) => {
            const updatedRoutes = { ...prevFlightRoutes };
            if (updatedRoutes[event.flight_id]) {
              updatedRoutes[event.flight_id] = {
                ...updatedRoutes[event.flight_id],
                color: 'green',
                weight: 6, 
                status: 'landed',
              };
            }
            return updatedRoutes;
          });
        }
        if (event.type === 'crashed') {
          setVisiblePlanes((prevVisiblePlanes) => {
            const updatedPlanes = { ...prevVisiblePlanes };
            if (updatedPlanes[event.flight_id]) {
              updatedPlanes[event.flight_id] = {
                ...updatedPlanes[event.flight_id],
                icon: ambulanceIcon, 
              };
            }
            return updatedPlanes;
          });

          
          setTimeout(() => {
            setVisiblePlanes((prevVisiblePlanes) => {
              const updatedPlanes = { ...prevVisiblePlanes };
              if (updatedPlanes[event.flight_id] && updatedPlanes[event.flight_id].icon === ambulanceIcon) {
                delete updatedPlanes[event.flight_id];
              }
              return updatedPlanes;
            });
          }, 60000);
        }
      });
    }
  }, [eventMarkers]);

  return (
    <MapContainer center={[0, 0]} zoom={2} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {Object.keys(airportMarkers).map((key) => {
        const marker = airportMarkers[key];
        return (
          <Marker key={key} position={marker.position} icon={marker.icon}>
            <Popup>
              <strong>Airport:</strong> {marker.name}<br />
              <strong>City:</strong> {marker.city}<br />
              <strong>Country:</strong> {marker.country}
            </Popup>
          </Marker>
        );
      })}
      {Object.keys(visiblePlanes).map((planeId) => {
        const plane = visiblePlanes[planeId];
        const icon = plane.status === 'crashed' ? ambulanceIcon : planeIcon;
        return (
          <Marker
            key={planeId}
            position={[plane.position.lat, plane.position.long]}
            icon={icon}
          >
            <Popup>
              <strong>Flight ID:</strong> {plane.flight_id}<br />
              <strong>Airline:</strong> {plane.airline?.name || 'N/A'}<br />
              <strong>Captain:</strong> {plane.captain || 'N/A'}<br />
              <strong>ETA:</strong> {plane.ETA?.toString() || 'N/A'}<br />
              <strong>Status:</strong> {plane.status || 'N/A'}<br />
              <strong>Arrival:</strong> {plane.arrival || 'N/A'}
            </Popup>
          </Marker>
        );
      })}
      {Object.keys(flightRoutes).map((flightId) => (
        <Polyline key={flightId} positions={flightRoutes[flightId].positions} pathOptions={{ color: flightRoutes[flightId].color, weight: flightRoutes[flightId].weight }} />
      ))}
    </MapContainer>
  );
}

MapView.propTypes = {
  flightsData: PropTypes.object.isRequired,
  planesData: PropTypes.object.isRequired,
  eventMarkers: PropTypes.array.isRequired,
};

export default MapView;