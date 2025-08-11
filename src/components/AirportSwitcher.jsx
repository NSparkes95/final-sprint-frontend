import { useEffect, useState } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { normalizeAirport } from '../services/transformers';

export default function AirportSwitcher() {
  const [airports, setAirports] = useState([]);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const currentId = searchParams.get('airportId') || localStorage.getItem('airportId') || '';

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/airports');
        const list = (res?.data ?? []).map(normalizeAirport).filter(Boolean);
        setAirports(list);
        if (!currentId && list.length) {
          // seed URL + storage with first airport
          handleChange(list[0].id);
        }
      } catch (e) {
        console.error(e);
        setError('Failed to load airports');
      }
    })();
  }, []);

  const handleChange = (nextId) => {
    const params = new URLSearchParams(location.search);
    if (nextId) params.set('airportId', String(nextId));
    else params.delete('airportId');
    localStorage.setItem('airportId', String(nextId || ''));
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  if (error) return <div role="alert">{error}</div>;

  return (
    <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
      <span>Airport:</span>
      <select
        aria-label="Select airport"
        value={currentId}
        onChange={(e) => handleChange(e.target.value)}
      >
        {airports.map(a => (
          <option key={a.id} value={a.id}>
            {a.code ? `${a.code} — ${a.name}` : a.name}
          </option>
        ))}
      </select>
    </label>
  );
}
