import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { normalizeFlight } from '../services/transformers';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isTest = import.meta?.env?.MODE === 'test';

export default function Arrivals() {
  const [arrivals, setArrivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Read airportId from the URL, fallback to last-used from localStorage
  const [searchParams] = useSearchParams();
  const airportId =
    searchParams.get('airportId') || localStorage.getItem('airportId') || '';

  useEffect(() => {
    const fetchArrivals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (!isTest) await sleep(1000); // keep UX delay but skip in tests

        // Preferred: dedicated /arrivals endpoint with optional airportId param
        const res = await api.get('/arrivals', {
          params: airportId ? { airportId } : {},
        });

        const data = Array.isArray(res?.data) ? res.data : [];
        const normalized = data.map(normalizeFlight).filter(Boolean);

        setArrivals(normalized);
      } catch (err) {
        console.error('Error fetching arrivals:', err);
        setError('Error fetching arrivals. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArrivals();
  }, [airportId]);

  return (
    <div>
      <h2>Arrivals</h2>
      {isLoading && <p>Loading arrivals...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!isLoading && !error && arrivals.length === 0 && <p>No arrivals found.</p>}

      {!isLoading && !error && arrivals.length > 0 && (
        <ul role="list">
          {arrivals.map((flight) => (
            <li role="listitem" key={flight.id}>
              ✈️ <strong>{flight.aircraft?.airlineName || 'Unknown Airline'}</strong>{' '}
              from <strong>{flight.departureAirport?.name || 'Unknown'}</strong>{' '}
              to <strong>{flight.arrivalAirport?.name || 'Unknown'}</strong>
              <br />
              Gate: {flight.gate?.code || 'TBD'} | Type: {flight.aircraft?.type || 'Unknown'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
