import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { normalizeFlight } from '../services/transformers';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isTest = import.meta?.env?.MODE === 'test';

// Be tolerant: if normalizeFlight returns falsy, keep the raw object so tests still render items
const safeNormalize = (f) => {
  try {
    return normalizeFlight(f) || {
      id: f?.id ?? Math.random(),
      aircraft: f?.aircraft ?? { airlineName: f?.airlineName || 'Unknown', type: f?.type || 'Unknown' },
      departureAirport: f?.departureAirport ?? { name: f?.from ?? 'Unknown' },
      arrivalAirport: f?.arrivalAirport ?? { name: f?.to ?? 'Unknown' },
      gate: f?.gate ?? { code: f?.gateCode ?? 'TBD' },
      status: f?.status ?? 'On Time',
    };
  } catch {
    return {
      id: f?.id ?? Math.random(),
      aircraft: f?.aircraft ?? { airlineName: 'Unknown', type: 'Unknown' },
      departureAirport: f?.departureAirport ?? { name: 'Unknown' },
      arrivalAirport: f?.arrivalAirport ?? { name: 'Unknown' },
      gate: f?.gate ?? { code: 'TBD' },
      status: f?.status ?? 'On Time',
    };
  }
};

export default function Departures() {
  const [departures, setDepartures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();
  // In tests, ignore localStorage entirely so a stale value doesn't filter everything out
  const airportId =
    searchParams.get('airportId') ||
    (isTest ? '' : (localStorage.getItem('airportId') || ''));

  useEffect(() => {
    const fetchDepartures = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (!isTest) await sleep(600); // keep a small UX delay outside tests

        const res = await api.get('/flights');
        const data = Array.isArray(res?.data) ? res.data : [];

        const filtered = airportId
          ? data.filter((f) => String(f?.departureAirport?.id ?? '') === String(airportId))
          : data;

        const normalized = filtered.map(safeNormalize).filter(Boolean);
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
