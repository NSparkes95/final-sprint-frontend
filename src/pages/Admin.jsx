import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  normalizeFlight,
  normalizeGate,
  normalizeAirport,
} from "../services/transformers";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isTest = import.meta?.env?.MODE === "test";

export default function Admin() {
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editingFlightId, setEditingFlightId] = useState(null);

  // Flight form
  const [form, setForm] = useState({
    airlineName: "",
    type: "",
    departureAirportId: "",
    arrivalAirportId: "",
    gateId: "",
  });

  // Lookups
  const [gates, setGates] = useState([]);
  const [airports, setAirports] = useState([]);

  // Simple Gate CRUD
  const [gateForm, setGateForm] = useState({ code: "" });
  const [editingGateId, setEditingGateId] = useState(null);

  // Simple Airport CRUD
  const [airportForm, setAirportForm] = useState({ name: "" });
  const [editingAirportId, setEditingAirportId] = useState(null);

  // ===== Fetchers =====
  const fetchFlights = async () => {
    try {
      setIsLoading(true);
      if (!isTest) await sleep(500);
      const response = await api.get("/flights");
      const normalized = (response?.data ?? []).map(normalizeFlight).filter(Boolean);
      setFlights(normalized);
      setError(null);
    } catch (err) {
      console.error("Error fetching flights:", err);
      setError("Error fetching flights. Please try again later.");
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
      console.error("Error fetching gates:", err);
      setError("Failed to fetch gates.");
    }
  };

  const fetchAirports = async () => {
    try {
      const res = await api.get("/airports");
      const normalized = (res?.data ?? []).map(normalizeAirport).filter(Boolean);
      setAirports(normalized);
    } catch (err) {
      console.error("Error fetching airports:", err);
      setError("Failed to fetch airports.");
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
      aircraft: {
        airlineName: form.airlineName,
        type: form.type,
      },
      departureAirportId: form.departureAirportId || null,
      arrivalAirportId: form.arrivalAirportId || null,
      gateId: form.gateId || null,
    };

    if (!flightData.aircraft.airlineName || !flightData.aircraft.type) {
      setError("Please provide airline name and aircraft type.");
      return;
    }
    if (!flightData.departureAirportId || !flightData.arrivalAirportId) {
      setError("Please select both departure and arrival airports.");
      return;
    }

    try {
      setSaving(true);
      if (editingFlightId) {
        await api.put(`/flights/${editingFlightId}`, flightData);
      } else {
        await api.post("/flights", flightData);
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
      setError(null);
    } catch (err) {
      console.error("Error saving flight:", err);
      setError("Failed to save flight. Please check your input.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditFlight = (flight) => {
    const dep = airports.find((a) => a.name === flight?.departureAirport?.name);
    const arr = airports.find((a) => a.name === flight?.arrivalAirport?.name);
    const g = gates.find((g) => g.code === flight?.gate?.code);

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
      await api.delete(`/flights/${id}`);
      await fetchFlights();
    } catch (err) {
      console.error("Error deleting flight:", err);
      setError("Failed to delete flight.");
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

  // ===== Gate CRUD =====
  const handleAddOrUpdateGate = async () => {
    try {
      if (editingGateId) {
        await api.put(`/gates/${editingGateId}`, gateForm);
      } else {
        await api.post("/gates", gateForm);
      }
      setGateForm({ code: "" });
      setEditingGateId(null);
      fetchGates();
    } catch (err) {
      console.error("Error saving gate:", err);
      setError("Failed to save gate.");
    }
  };

  const handleEditGate = (gate) => {
    setGateForm({ code: gate.code });
    setEditingGateId(gate.id);
  };

  const handleDeleteGate = async (id) => {
    try {
      await api.delete(`/gates/${id}`);
      fetchGates();
    } catch (err) {
      console.error("Error deleting gate:", err);
      setError("Failed to delete gate.");
    }
  };

  const handleCancelGateEdit = () => {
    setEditingGateId(null);
    setGateForm({ code: "" });
  };

  // ===== Airport CRUD =====
  const handleAddOrUpdateAirport = async () => {
    try {
      if (editingAirportId) {
        await api.put(`/airports/${editingAirportId}`, airportForm);
      } else {
        await api.post("/airports", airportForm);
      }
      setAirportForm({ name: "" });
      setEditingAirportId(null);
      fetchAirports();
    } catch (err) {
      console.error("Error saving airport:", err);
      setError("Failed to save airport.");
    }
  };

  const handleEditAirport = (airport) => {
    setAirportForm({ name: airport.name });
    setEditingAirportId(airport.id);
  };

  const handleDeleteAirport = async (id) => {
    try {
      await api.delete(`/airports/${id}`);
      fetchAirports();
    } catch (err) {
      console.error("Error deleting airport:", err);
      setError("Failed to delete airport.");
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

      {/* GATE CRUD SECTION */}
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
              onChange={(e) => setGateForm({ code: e.target.value })}
            />
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

      {/* AIRPORT CRUD SECTION */}
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
            {editingAirportId && (
              <button onClick={handleCancelAirportEdit}>Cancel</button>
            )}
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
