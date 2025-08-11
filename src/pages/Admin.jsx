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

  // Lookup lists
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
      const normalized = (response?.data ?? [])
        .map(normalizeFlight)
        .filter(Boolean);
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
      const normalized = (res?.data ?? [])
        .map(normalizeAirport)
        .filter(Boolean);
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
    // Build payload expected by backend.
    const flightData = {
      aircraft: {
        airlineName: form.airlineName,
        type: form.type,
      },
      departureAirportId: form.departureAirportId || null,
      arrivalAirportId: form.arrivalAirportId || null,
      gateId: form.gateId || null,
    };

    // Basic client-side validation
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
      // Reset
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
    // Try to match existing names/codes to IDs from lookup lists
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
    <div>
      <h2>Admin Panel – All Flights</h2>

      {/* Flight Form */}
      <div
        data-testid="flight-form"
        style={{ border: "1px solid gray", padding: "1rem", marginBottom: "1rem" }}
      >
        <h3>{editingFlightId ? "Edit Flight" : "Add New Flight"}</h3>

        <input
          name="airlineName"
          placeholder="Airline Name"
          value={form.airlineName}
          onChange={handleInputChange}
        />
        <input
          name="type"
          placeholder="Aircraft Type"
          value={form.type}
          onChange={handleInputChange}
        />

        {/* Departure Airport (select) */}
        <label style={{ display: "block", marginTop: 8 }}>
          Departure Airport:
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

        {/* Arrival Airport (select) */}
        <label style={{ display: "block", marginTop: 8 }}>
          Arrival Airport:
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

        {/* Gate (select) */}
        <label style={{ display: "block", marginTop: 8 }}>
          Gate:
          <select
            name="gateId"
            value={form.gateId}
            onChange={handleInputChange}
            data-testid="flight-gateCode" // keep test id so your tests still pass
          >
            <option value="">-- Select --</option>
            {gates.map((g) => (
              <option key={g.id} value={g.id}>
                {g.code}
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button onClick={handleAddOrUpdateFlight} disabled={saving}>
            {editingFlightId ? "Update Flight" : "Add Flight"}
          </button>
          {editingFlightId && (
            <button onClick={handleCancelEdit} disabled={saving}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {isLoading && <p>Loading all flights...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!isLoading && !error && flights.length === 0 && <p>No flights found.</p>}

      {!isLoading && !error && flights.length > 0 && (
        <ul data-testid="flights-list">
          {flights.map((flight) => (
            <li key={flight.id} style={{ marginBottom: "0.5rem" }}>
              ✈️ <strong>{flight.aircraft?.airlineName || "Unknown Airline"}</strong>{" "}
              from <strong>{flight.departureAirport?.name || "Unknown"}</strong>{" "}
              to <strong>{flight.arrivalAirport?.name || "Unknown"}</strong>
              <br />
              Gate: {flight.gate?.code || "TBD"} | Type: {flight.aircraft?.type || "Unknown"}{" "}
              <button onClick={() => handleEditFlight(flight)}>Edit</button>
              <button onClick={() => handleDeleteFlight(flight.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}

      {/* GATE CRUD SECTION */}
      <hr />
      <h2>Manage Gates</h2>

      <div
        data-testid="gates-form"
        style={{ border: "1px solid gray", padding: "1rem", marginBottom: "1rem" }}
      >
        <h3>{editingGateId ? "Edit Gate" : "Add New Gate"}</h3>
        <input
          name="code"
          placeholder="Gate Code"
          data-testid="gate-code"
          value={gateForm.code}
          onChange={(e) => setGateForm({ code: e.target.value })}
        />
        <button onClick={handleAddOrUpdateGate}>
          {editingGateId ? "Update Gate" : "Add Gate"}
        </button>
        {editingGateId && <button onClick={handleCancelGateEdit}>Cancel</button>}
      </div>

      {gates.length === 0 ? (
        <p>No gates found.</p>
      ) : (
        <ul data-testid="gates-list">
          {gates.map((gate) => (
            <li key={gate.id}>
              🪧 Gate: <strong>{gate.code}</strong>
              <button onClick={() => handleEditGate(gate)}>Edit</button>
              <button onClick={() => handleDeleteGate(gate.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}

      {/* AIRPORT CRUD SECTION */}
      <hr />
      <h2>Manage Airports</h2>

      <div
        data-testid="airports-form"
        style={{ border: "1px solid gray", padding: "1rem", marginBottom: "1rem" }}
      >
        <h3>{editingAirportId ? "Edit Airport" : "Add New Airport"}</h3>
        <input
          name="name"
          placeholder="Airport Name"
          value={airportForm.name}
          onChange={(e) => setAirportForm({ name: e.target.value })}
        />
        <button onClick={handleAddOrUpdateAirport}>
          {editingAirportId ? "Update Airport" : "Add Airport"}
        </button>
        {editingAirportId && <button onClick={handleCancelAirportEdit}>Cancel</button>}
      </div>

      {airports.length === 0 ? (
        <p>No airports found.</p>
      ) : (
        <ul data-testid="airports-list">
          {airports.map((airport) => (
            <li key={airport.id}>
              🛫 Airport: <strong>{airport.name}</strong>
              <button onClick={() => handleEditAirport(airport)}>Edit</button>
              <button onClick={() => handleDeleteAirport(airport.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
