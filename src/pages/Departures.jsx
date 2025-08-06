import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Departures = () => {
  const [departures, setDepartures] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/flights')
      .then(response => {
        const data = response.data;
        const filteredDepartures = data.filter(
          flight => flight.departureAirport?.name === "St. John's Intl"
        );
        setDepartures(filteredDepartures);
      })
      .catch(error => {
        console.error('Error fetching flights:', error);
      });
  }, []);

  return (
    <div>
      <h2>Departures</h2>
      {departures.length === 0 ? (
        <p>No departures found.</p>
      ) : (
        <ul>
          {departures.map((flight) => (
            <li key={flight.id}>
              ✈️ <strong>{flight.aircraft?.airlineName || 'Unknown Airline'}</strong>  
              from <strong>{flight.departureAirport?.name || 'Unknown'}</strong>  
              to <strong>{flight.arrivalAirport?.name || 'Unknown'}</strong><br />
              Gate: {flight.gate?.code || 'TBD'} | Type: {flight.aircraft?.type || 'Unknown'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Departures;
