import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { normalizeFlight } from '../services/transformers';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isTest = import.meta?.env?.MODE === 'test';

export default function Departures() {
  const [departures, setDepartures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Read airportId from the URL, fallback to last-used from localStorage
  const [searchParams] = useSearchParams();
  const airportId =
    searchParams.get('airportId') || localStorage.getItem('airportId') || '';

  useEffect(() => {
    const fetchDepartures = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (!isTest) await sleep(1000);

        // Preferred: dedicated /departures endpoint with optional airportId param
        const res = await api.get('/departures', {
          params: airportId ? { airportId } : {},
        });

        const data = Array.isArray(res?.data) ? res.data : [];
        const normalized = data.map(normalizeFlight).filter(Boolean);

        setDepartures(normalized);
      } catch (err) {
        console.error('Error fetching departures:', err);
        setError('Error fetching departures. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartures();
  }, [airportId]);

  return (
    <div>
      <h2>Departures</h2>
      {isLoading && <p>Loading departures...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!isLoading && !error && departures.length === 0 && <p>No departures found.</p>}

      {!isLoading && !error && departures.length > 0 && (
        <ul role="list">
          {departures.map((flight) => (
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
