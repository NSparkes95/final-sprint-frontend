import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Arrivals = () => {
  const [arrivals, setArrivals] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/flights')
      .then(response => {
        const data = response.data;
        const filteredArrivals = data.filter(
          flight => flight.arrivalAirport?.name === "St. John's Intl"
        );
        setArrivals(filteredArrivals);
      })
      .catch(error => {
        console.error('Error fetching flights:', error);
      });
  }, []);

  return (
    <div>
      <h2>Arrivals</h2>
      {arrivals.length === 0 ? (
        <p>No arrivals found.</p>
      ) : (
        <ul>
          {arrivals.map((flight) => (
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

export default Arrivals;
