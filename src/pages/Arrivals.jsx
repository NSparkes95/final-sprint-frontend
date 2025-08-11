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

        const res = await api.get('/flights');
        const data = Array.isArray(res?.data) ? res.data : [];

        const filtered = airportId
          ? data.filter(f => String(f?.arrivalAirport?.id ?? '') === String(airportId))
          : data;

        const normalized = filtered.map(normalizeFlight).filter(Boolean);
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
    <div className="container">
      <h2>Arrivals</h2>

      {isLoading && <p className="loading">Loading arrivals...</p>}
      {error && <p className="status error">{error}</p>}
      {!isLoading && !error && arrivals.length === 0 && (
        <p className="empty">No arrivals found.</p>
      )}

      {!isLoading && !error && arrivals.length > 0 && (
        <ul className="flight-list" role="list">
          {arrivals.map((flight) => {
            const statusText = flight.status || 'On Time';
            const statusClass = `status ${statusText.toLowerCase().replace(/\s+/g, '-')}`;

            return (
              <li role="listitem" key={flight.id}>
                <div className="flight-header">
                  <span>
                    ✈️ <strong>{flight.aircraft?.airlineName || 'Unknown Airline'}</strong>{' '}
                    ({flight.aircraft?.type || 'Unknown'})
                  </span>
                  <span className={statusClass}>{statusText}</span>
                </div>

                <div className="flight-info">
                  From <strong>{flight.departureAirport?.name || 'Unknown'}</strong>{' '}
                  to <strong>{flight.arrivalAirport?.name || 'Unknown'}</strong>{' '}
                  — Gate {flight.gate?.code || 'TBD'}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
