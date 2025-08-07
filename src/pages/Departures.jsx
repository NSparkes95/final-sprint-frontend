import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Departures = () => {
  const [departures, setDepartures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartures = async () => {
      try {
        setIsLoading(true);

        // Artificial delay for testing the loading spinner
        await new Promise(resolve => setTimeout(resolve, 1000));

        const response = await axios.get('http://localhost:8080/flights');
        const data = response.data;
        const filteredDepartures = data.filter(
          flight => flight.departureAirport?.name === "St. John's Intl"
        );
        setDepartures(filteredDepartures);
        setError(null);
      } catch (err) {
        console.error('Error fetching flights:', err);
        setError('Error fetching departures. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartures();
  }, []);

  return (
    <div>
      <h2>Departures</h2>

      {isLoading && <p>Loading departures...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!isLoading && !error && departures.length === 0 && (
        <p>No departures found.</p>
      )}

      {!isLoading && !error && departures.length > 0 && (
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
