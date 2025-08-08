import React, { useEffect, useState } from "react";
import axios from "axios";

const Admin = () => {
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingFlightId, setEditingFlightId] = useState(null);

  const [form, setForm] = useState({
    airlineName: "",
    type: "",
    departureAirport: "",
    arrivalAirport: "",
    gateCode: "",
  });

  const [gates, setGates] = useState([]);
  const [gateForm, setGateForm] = useState({ code: "" });
  const [editingGateId, setEditingGateId] = useState(null);

  const [airports, setAirports] = useState([]);
  const [airportForm, setAirportForm] = useState({ name: "" });
  const [editingAirportId, setEditingAirportId] = useState(null);

  const fetchFlights = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = await axios.get("http://localhost:8080/flights");
      setFlights(response.data);
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
      const res = await axios.get("http://localhost:8080/gates");
      setGates(res.data);
    } catch (err) {
      console.error("Error fetching gates:", err);
      setError("Failed to fetch gates.");
    }
  };

  const fetchAirports = async () => {
    try {
      const res = await axios.get("http://localhost:8080/airports");
      setAirports(res.data);
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

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdateFlight = async () => {
    const flightData = {
      aircraft: {
        airlineName: form.airlineName,
        type: form.type,
      },
      departureAirport: {
        name: form.departureAirport,
      },
      arrivalAirport: {
        name: form.arrivalAirport,
      },
      gate: {
        code: form.gateCode,
      },
    };

    try {
      if (editingFlightId) {
        await axios.put(`http://localhost:8080/flights/${editingFlightId}`, flightData);
      } else {
        await axios.post("http://localhost:8080/flights", flightData);
      }

      setForm({
        airlineName: "",
        type: "",
        departureAirport: "",
        arrivalAirport: "",
        gateCode: "",
      });
      setEditingFlightId(null);
      fetchFlights();
    } catch (err) {
      console.error("Error saving flight:", err);
      setError("Failed to save flight. Please check your input.");
    }
  };

  const handleEditFlight = (flight) => {
    setEditingFlightId(flight.id);
    setForm({
      airlineName: flight.aircraft?.airlineName || "",
      type: flight.aircraft?.type || "",
      departureAirport: flight.departureAirport?.name || "",
      arrivalAirport: flight.arrivalAirport?.name || "",
      gateCode: flight.gate?.code || "",
    });
  };

  const handleDeleteFlight = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/flights/${id}`);
      fetchFlights();
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
      departureAirport: "",
      arrivalAirport: "",
      gateCode: "",
    });
  };

  const handleAddOrUpdateGate = async () => {
    try {
      if (editingGateId) {
        await axios.put(`http://localhost:8080/gates/${editingGateId}`, gateForm);
      } else {
        await axios.post("http://localhost:8080/gates", gateForm);
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
      await axios.delete(`http://localhost:8080/gates/${id}`);
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

  const handleAddOrUpdateAirport = async () => {
    try {
      if (editingAirportId) {
        await axios.put(`http://localhost:8080/airports/${editingAirportId}`, airportForm);
      } else {
        await axios.post("http://localhost:8080/airports", airportForm);
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
      await axios.delete(`http://localhost:8080/airports/${id}`);
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
      <div style={{ border: "1px solid gray", padding: "1rem", marginBottom: "1rem" }}>
        <h3>{editingFlightId ? "Edit Flight" : "Add New Flight"}</h3>
        <input name="airlineName" placeholder="Airline Name" value={form.airlineName} onChange={handleInputChange} />
        <input name="type" placeholder="Aircraft Type" value={form.type} onChange={handleInputChange} />
        <input name="departureAirport" placeholder="Departure Airport" value={form.departureAirport} onChange={handleInputChange} />
        <input name="arrivalAirport" placeholder="Arrival Airport" value={form.arrivalAirport} onChange={handleInputChange} />
        <input name="gateCode" placeholder="Gate Code" value={form.gateCode} onChange={handleInputChange} />
        <button onClick={handleAddOrUpdateFlight}>{editingFlightId ? "Update Flight" : "Add Flight"}</button>
        {editingFlightId && <button onClick={handleCancelEdit}>Cancel</button>}
      </div>

      {isLoading && <p>Loading all flights...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!isLoading && !error && flights.length === 0 && <p>No flights found.</p>}

      {!isLoading && !error && flights.length > 0 && (
        <ul>
          {flights.map((flight) => (
            <li key={flight.id} style={{ marginBottom: "0.5rem" }}>
              ✈️ <strong>{flight.aircraft?.airlineName || "Unknown Airline"}</strong>
              from <strong>{flight.departureAirport?.name || "Unknown"}</strong>
              to <strong>{flight.arrivalAirport?.name || "Unknown"}</strong><br />
              Gate: {flight.gate?.code || "TBD"} | Type: {flight.aircraft?.type || "Unknown"}
              <button onClick={() => handleEditFlight(flight)}>Edit</button>
              <button onClick={() => handleDeleteFlight(flight.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}

      {/* GATE CRUD SECTION */}
      <hr />
      <h2>Manage Gates</h2>

      <div style={{ border: "1px solid gray", padding: "1rem", marginBottom: "1rem" }}>
        <h3>{editingGateId ? "Edit Gate" : "Add New Gate"}</h3>
        <input name="code" placeholder="Gate Code" value={gateForm.code} onChange={(e) => setGateForm({ code: e.target.value })} />
        <button onClick={handleAddOrUpdateGate}>{editingGateId ? "Update Gate" : "Add Gate"}</button>
        {editingGateId && <button onClick={handleCancelGateEdit}>Cancel</button>}
      </div>

      {gates.length === 0 ? <p>No gates found.</p> : (
        <ul>
          {gates.map(gate => (
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

      <div style={{ border: "1px solid gray", padding: "1rem", marginBottom: "1rem" }}>
        <h3>{editingAirportId ? "Edit Airport" : "Add New Airport"}</h3>
        <input name="name" placeholder="Airport Name" value={airportForm.name} onChange={(e) => setAirportForm({ name: e.target.value })} />
        <button onClick={handleAddOrUpdateAirport}>{editingAirportId ? "Update Airport" : "Add Airport"}</button>
        {editingAirportId && <button onClick={handleCancelAirportEdit}>Cancel</button>}
      </div>

      {airports.length === 0 ? <p>No airports found.</p> : (
        <ul>
          {airports.map(airport => (
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
};

export default Admin;
