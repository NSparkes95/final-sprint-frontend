import React, { useEffect, useState } from 'react';
import api from '../services/api';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isTest = import.meta?.env?.MODE === 'test';

const Arrivals = () => {
  const [arrivals, setArrivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArrivals = async () => {
      try {
        setIsLoading(true);
        if (!isTest) await sleep(1000); // keep UX delay but skip in tests
        const res = await api.get('/flights');
        const data = res.data || [];
        const filtered = data.filter(
          (f) => f.arrivalAirport?.name === "St. John's Intl"
        );
        setArrivals(filtered);
        setError(null);
      } catch (err) {
        console.error('Error fetching flights:', err);
        setError('Error fetching arrivals. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchArrivals();
  }, []);

  return (
    <div>
      <h2>Arrivals</h2>
      {isLoading && <p>Loading arrivals...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!isLoading && !error && arrivals.length === 0 && <p>No arrivals found.</p>}

      {!isLoading && !error && arrivals.length > 0 && (
        <ul>
          {arrivals.map((flight) => (
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

export default Arrivals;
