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
        if (!isTest) await sleep(1000); // skip delay in tests

        // Dedicated /departures endpoint with optional airportId filter
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
    <div className="container">
      <h2>Departures</h2>

      {isLoading && <p className="loading">Loading departures...</p>}
      {error && <p className="status error">{error}</p>}
      {!isLoading && !error && departures.length === 0 && (
        <p className="empty">No departures found.</p>
      )}

      {!isLoading && !error && departures.length > 0 && (
        <ul className="flight-list" role="list">
          {departures.map((flight) => {
            const statusText = flight.status || 'On Time'; // fallback if no status from API
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
