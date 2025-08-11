import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  normalizeFlight,
  normalizeGate,
  normalizeAirport,
} from "../services/transformers";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isTest = import.meta?.env?.MODE === "test";

const getErrMsg = (err, fallback) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  (typeof err?.response?.data === "string" ? err.response.data : null) ||
  err?.message ||
  fallback;

export default function Admin() {
  const [flights, setFlights] = useState([]);
  const [gates, setGates] = useState([]);
  const [airports, setAirports] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [editingFlightId, setEditingFlightId] = useState(null);
  const [editingGateId, setEditingGateId] = useState(null);
  const [editingAirportId, setEditingAirportId] = useState(null);

  // Flight form
  const [form, setForm] = useState({
    airlineName: "",
    type: "",
    departureAirportId: "",
    arrivalAirportId: "",
    gateId: "",
  });

  // Gate form (now includes airportId)
  const [gateForm, setGateForm] = useState({ code: "", airportId: "" });

  // Airport form
  const [airportForm, setAirportForm] = useState({ name: "" });

  // ===== Fetchers =====
  const fetchFlights = async () => {
    try {
      setIsLoading(true);
      if (!isTest) await sleep(300);
      const res = await api.get("/flights");
      const normalized = (res?.data ?? []).map(normalizeFlight).filter(Boolean);
      setFlights(normalized);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(getErrMsg(err, "Error fetching flights. Please try again later."));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGates = async () => {
    try {
      const res = await api.get("/gates");
      const normalized = (res?.data ?? []).map(normalizeGate).filter(Boolean);
      setGates(normalized);
    } catch (err) {
      console.error(err);
      setError(getErrMsg(err, "Failed to fetch gates."));
    }
  };

  const fetchAirports = async () => {
    try {
      const res = await api.get("/airports");
      const normalized = (res?.data ?? []).map(normalizeAirport).filter(Boolean);
      setAirports(normalized);
    } catch (err) {
      console.error(err);
      setError(getErrMsg(err, "Failed to fetch airports."));
    }
  };

  useEffect(() => {
    fetchFlights();
    fetchGates();
    fetchAirports();
  }, []);

  // ===== Flight CRUD =====
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleAddOrUpdateFlight = async () => {
    const flightData = {
      aircraft: { airlineName: form.airlineName, type: form.type },
      departureAirport: { id: Number(form.departureAirportId) },
      arrivalAirport: { id: Number(form.arrivalAirportId) },
      gate: { id: Number(form.gateId) },
    };

    if (!flightData.aircraft.airlineName || !flightData.aircraft.type) {
      setError("Please provide airline name and aircraft type.");
      return;
    }
    if (!form.departureAirportId || !form.arrivalAirportId) {
      setError("Please select both departure and arrival airports.");
      return;
    }

    try {
      setError(null);
      setSaving(true);
      if (editingFlightId) {
        await api.put(`/flight/${Number(editingFlightId)}`, flightData);
      } else {
        await api.post("/flight", flightData);
      }
      setForm({
        airlineName: "",
        type: "",
        departureAirportId: "",
        arrivalAirportId: "",
        gateId: "",
      });
      setEditingFlightId(null);
      await fetchFlights();
    } catch (err) {
      console.error(err);
      setError(getErrMsg(err, "Failed to save flight. Please check your input."));
    } finally {
      setSaving(false);
    }
  };

  const handleEditFlight = (flight) => {
    const dep = airports.find((a) => a.name === flight?.departureAirport?.name);
    const arr = airports.find((a) => a.name === flight?.arrivalAirport?.name);
    const g = gates.find((x) => x.code === flight?.gate?.code);
    setEditingFlightId(flight.id);
    setForm({
      airlineName: flight.aircraft?.airlineName || "",
      type: flight.aircraft?.type || "",
      departureAirportId: dep?.id || "",
      arrivalAirportId: arr?.id || "",
      gateId: g?.id || "",
    });
  };

  const handleDeleteFlight = async (id) => {
    try {
      setError(null);
      await api.delete(`/flight/${Number(id)}`);
      await fetchFlights();
    } catch (err) {
      console.error(err);
      const body = err?.response?.data;
      if (/constraint|foreign key|integrity/i.test(String(body))) {
        setError("Cannot delete flight due to related records.");
      } else {
        setError(getErrMsg(err, "Failed to delete flight."));
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingFlightId(null);
    setForm({
      airlineName: "",
      type: "",
      departureAirportId: "",
      arrivalAirportId: "",
      gateId: "",
    });
  };

  // ===== Gate CRUD (JSON, includes airport) =====
  const handleAddOrUpdateGate = async () => {
    try {
      setError(null);

      if (!gateForm.code) {
        setError("Gate code is required.");
        return;
      }
      if (!gateForm.airportId) {
        setError("Please select an airport for this gate.");
        return;
      }

      const payload = {
        code: gateForm.code,
        airport: { id: Number(gateForm.airportId) },
        ...(editingGateId ? { id: Number(editingGateId) } : {}),
      };

      if (editingGateId) {
        await api.put(`/gate/${Number(editingGateId)}`, payload);
      } else {
        await api.post("/gate", payload);
      }

      setGateForm({ code: "", airportId: "" });
      setEditingGateId(null);
      await fetchGates();
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      const body = err?.response?.data;
      if (status === 415) {
        setError("Server rejected content type. (Backend expects JSON @RequestBody.)");
      } else if (status === 409 || /duplicate|unique/i.test(String(body))) {
        setError("Gate code must be unique.");
      } else if (/constraint|foreign key|integrity/i.test(String(body))) {
        setError("Cannot modify gate: it’s referenced by flights.");
      } else {
        setError(getErrMsg(err, "Failed to save gate."));
      }
    }
  };

  const handleEditGate = (gate) => {
    // try to map gate -> airportId if available
    const match = airports.find((a) => a.name === gate?.airport?.name || a.id === gate?.airport?.id);
    setGateForm({ code: gate.code, airportId: match?.id || "" });
    setEditingGateId(gate.id);
  };

  const handleDeleteGate = async (id) => {
    try {
      setError(null);
      await api.delete(`/gate/${Number(id)}`);
      await fetchGates();
    } catch (err) {
      console.error(err);
      const body = err?.response?.data;
      if (/constraint|foreign key|integrity/i.test(String(body))) {
        setError("Cannot delete gate: it’s assigned to one or more flights.");
      } else {
        setError(getErrMsg(err, "Failed to delete gate."));
      }
    }
  };

  const handleCancelGateEdit = () => {
    setEditingGateId(null);
    setGateForm({ code: "", airportId: "" });
  };

  // ===== Airport CRUD (JSON) =====
  const handleAddOrUpdateAirport = async () => {
    try {
      setError(null);

      if (!airportForm.name) {
        setError("Airport name is required.");
        return;
      }

      const payload = {
        name: airportForm.name,
        ...(editingAirportId ? { id: Number(editingAirportId) } : {}),
      };

      if (editingAirportId) {
        await api.put(`/airport/${Number(editingAirportId)}`, payload);
      } else {
        await api.post("/airport", payload);
      }

      setAirportForm({ name: "" });
      setEditingAirportId(null);
      await fetchAirports();
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      const body = err?.response?.data;
      if (status === 415) {
        setError("Server rejected content type. (Backend expects JSON @RequestBody.)");
      } else if (status === 409 || /duplicate|unique/i.test(String(body))) {
        setError("Airport name must be unique.");
      } else {
        setError(getErrMsg(err, "Failed to save airport."));
      }
    }
  };

  const handleEditAirport = (airport) => {
    setAirportForm({ name: airport.name });
    setEditingAirportId(airport.id);
  };

  const handleDeleteAirport = async (id) => {
    try {
      setError(null);
      await api.delete(`/airport/${Number(id)}`);
      await fetchAirports();
    } catch (err) {
      console.error(err);
      const body = err?.response?.data;
      if (/constraint|foreign key|integrity/i.test(String(body))) {
        setError("Cannot delete airport: it’s referenced by one or more flights or gates.");
      } else {
        setError(getErrMsg(err, "Failed to delete airport."));
      }
    }
  };

  const handleCancelAirportEdit = () => {
    setEditingAirportId(null);
    setAirportForm({ name: "" });
  };

  return (
    <div className="container">
      <h2>Admin Panel – All Flights</h2>

      {/* Flight Form */}
      <div data-testid="flight-form" className="panel stack" style={{ marginBottom: 16 }}>
        <h3>{editingFlightId ? "Edit Flight" : "Add New Flight"}</h3>

        <div className="row">
          <label>
            Airline:
            <input
              name="airlineName"
              placeholder="Airline Name"
              value={form.airlineName}
              onChange={handleInputChange}
            />
          </label>

          <label>
            Aircraft:
            <input
              name="type"
              placeholder="Aircraft Type"
              value={form.type}
              onChange={handleInputChange}
            />
          </label>
        </div>

        <div className="row">
          <label>
            Departure:
            <select
              name="departureAirportId"
              value={form.departureAirportId}
              onChange={handleInputChange}
            >
              <option value="">-- Select --</option>
              {airports.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code ? `${a.code} — ${a.name}` : a.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Arrival:
            <select
              name="arrivalAirportId"
              value={form.arrivalAirportId}
              onChange={handleInputChange}
            >
              <option value="">-- Select --</option>
              {airports.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code ? `${a.code} — ${a.name}` : a.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Gate:
            <select
              name="gateId"
              value={form.gateId}
              onChange={handleInputChange}
              data-testid="flight-gateCode"
            >
              <option value="">-- Select --</option>
              {gates.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.code}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="row" style={{ marginTop: 6 }}>
          <button onClick={handleAddOrUpdateFlight} disabled={saving}>
            {editingFlightId ? "Update Flight" : "Add Flight"}
          </button>
          {editingFlightId && (
            <button onClick={handleCancelEdit} disabled={saving}>
              Cancel
            </button>
          )}
        </div>

        {error && <p className="status error">{error}</p>}
      </div>

      {isLoading && <p className="loading">Loading all flights...</p>}
      {!isLoading && !error && flights.length === 0 && (
        <p className="empty">No flights found.</p>
      )}

      {!isLoading && !error && flights.length > 0 && (
        <ul data-testid="flights-list" className="flight-list" role="list">
          {flights.map((flight) => (
            <li role="listitem" key={flight.id}>
              <div className="flight-header">
                <span>
                  ✈️ <strong>{flight.aircraft?.airlineName || "Unknown Airline"}</strong>{" "}
                  ({flight.aircraft?.type || "Unknown"})
                </span>
                <span className={`status ${(flight.status || "On Time").toLowerCase().replace(/\s+/g, "-")}`}>
                  {flight.status || "On Time"}
                </span>
              </div>
              <div className="flight-info">
                From <strong>{flight.departureAirport?.name || "Unknown"}</strong>{" "}
                to <strong>{flight.arrivalAirport?.name || "Unknown"}</strong> — Gate{" "}
                {flight.gate?.code || "TBD"}
              </div>
              <div className="row" style={{ marginTop: 8 }}>
                <button onClick={() => handleEditFlight(flight)}>Edit</button>
                <button onClick={() => handleDeleteFlight(flight.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* GATE CRUD */}
      <hr style={{ margin: "20px 0", borderColor: "var(--color-border)" }} />
      <h2>Manage Gates</h2>

      <div data-testid="gates-form" className="panel stack" style={{ marginBottom: 12 }}>
        <h3>{editingGateId ? "Edit Gate" : "Add New Gate"}</h3>
        <div className="row">
          <label>
            Code:
            <input
              name="code"
              placeholder="Gate Code"
              data-testid="gate-code"
              value={gateForm.code}
              onChange={(e) => setGateForm((s) => ({ ...s, code: e.target.value }))}
            />
          </label>
          <label>
            Airport:
            <select
              value={gateForm.airportId}
              onChange={(e) => setGateForm((s) => ({ ...s, airportId: e.target.value }))}
            >
              <option value="">-- Select --</option>
              {airports.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code ? `${a.code} — ${a.name}` : a.name}
                </option>
              ))}
            </select>
          </label>
          <div className="row">
            <button onClick={handleAddOrUpdateGate}>
              {editingGateId ? "Update Gate" : "Add Gate"}
            </button>
            {editingGateId && <button onClick={handleCancelGateEdit}>Cancel</button>}
          </div>
        </div>
      </div>

      {gates.length === 0 ? (
        <p className="empty">No gates found.</p>
      ) : (
        <ul data-testid="gates-list" className="flight-list" role="list">
          {gates.map((gate) => (
            <li role="listitem" key={gate.id}>
              <div className="flight-header">
                <span>🪧 Gate: <strong>{gate.code}</strong></span>
                <div className="row">
                  <button onClick={() => handleEditGate(gate)}>Edit</button>
                  <button onClick={() => handleDeleteGate(gate.id)}>Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* AIRPORT CRUD */}
      <hr style={{ margin: "20px 0", borderColor: "var(--color-border)" }} />
      <h2>Manage Airports</h2>

      <div data-testid="airports-form" className="panel stack" style={{ marginBottom: 12 }}>
        <h3>{editingAirportId ? "Edit Airport" : "Add New Airport"}</h3>
        <div className="row">
          <label>
            Name:
            <input
              name="name"
              placeholder="Airport Name"
              value={airportForm.name}
              onChange={(e) => setAirportForm({ name: e.target.value })}
            />
          </label>
          <div className="row">
            <button onClick={handleAddOrUpdateAirport}>
              {editingAirportId ? "Update Airport" : "Add Airport"}
            </button>
            {editingAirportId && <button onClick={handleCancelAirportEdit}>Cancel</button>}
          </div>
        </div>
      </div>

      {airports.length === 0 ? (
        <p className="empty">No airports found.</p>
      ) : (
        <ul data-testid="airports-list" className="flight-list" role="list">
          {airports.map((airport) => (
            <li role="listitem" key={airport.id}>
              <div className="flight-header">
                <span>🛫 Airport: <strong>{airport.name}</strong></span>
                <div className="row">
                  <button onClick={() => handleEditAirport(airport)}>Edit</button>
                  <button onClick={() => handleDeleteAirport(airport.id)}>Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
