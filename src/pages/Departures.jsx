import React, { useEffect, useState } from 'react';
import api from '../services/api';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isTest = import.meta?.env?.MODE === 'test';

const Departures = () => {
  const [departures, setDepartures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartures = async () => {
      try {
        setIsLoading(true);
        if (!isTest) await sleep(1000);
        const res = await api.get('/flights');
        const data = res.data || [];
        const filtered = data.filter(
          (f) => f.departureAirport?.name === "St. John's Intl"
        );
        setDepartures(filtered);
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
      {!isLoading && !error && departures.length === 0 && <p>No departures found.</p>}

      {!isLoading && !error && departures.length > 0 && (
        <ul>
          {departures.map((flight) => (
            <li key={flight.id}>
              ✈️ <strong>{flight.aircraft?.airlineName || 'Unknown Airline'}</strong>
              from <strong>{flight.departureAirport?.name || 'Unknown'}</strong>
              to <strong>{flight.arrivalAirport?.name || 'Unknown'}</strong>
              <br />
              Gate: {flight.gate?.code || 'TBD'} | Type: {flight.aircraft?.type || 'Unknown'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Departures;
