import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { normalizeAirport } from '../services/transformers';

export default function AirportSwitcher() {
  const [airports, setAirports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const currentId = searchParams.get('airportId') || localStorage.getItem('airportId') || '';

  const handleChange = useCallback((nextId) => {
    const params = new URLSearchParams(location.search);
    if (nextId) params.set('airportId', String(nextId));
    else params.delete('airportId');
    localStorage.setItem('airportId', String(nextId || ''));
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/airports');
        const list = (res?.data ?? []).map(normalizeAirport).filter(Boolean);
        setAirports(list);
        if (!currentId && list.length) {
          handleChange(list[0].id);
        }
      } catch (e) {
        console.error(e);
        setError('Failed to load airports.');
      } finally {
        setLoading(false);
      }
    })();
  }, [currentId, handleChange]);

  if (error) return <div role="alert" className="status error">{error}</div>;

  return (
    <div className="row" style={{ alignItems: 'center', marginBottom: 12 }}>
      <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
        <span>Airport:</span>
        <select
          aria-label="Select airport"
          value={currentId}
          onChange={(e) => handleChange(e.target.value)}
          disabled={loading || airports.length === 0}
        >
          {!currentId && <option value="">-- Select --</option>}
          {airports.map(a => (
            <option key={a.id} value={a.id}>
              {a.code ? `${a.code} — ${a.name}` : a.name}
            </option>
          ))}
        </select>
      </label>
      {loading && <span className="status">Loading airports…</span>}
    </div>
  );
}
