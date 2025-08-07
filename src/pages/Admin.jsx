import React, { useEffect, useState } from "react";
import axios from "axios";

const Admin = () => {
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setIsLoading(true);

        // Artificial delay for testing the loading spinner
        await new Promise(resolve => setTimeout(resolve, 1000));

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

    fetchFlights();
  }, []);

  return (
    <div>
      <h2>Admin Panel – All Flights</h2>

      {isLoading && <p>Loading all flights...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!isLoading && !error && flights.length === 0 && (
        <p>No flights found.</p>
      )}

      {!isLoading && !error && flights.length > 0 && (
        <ul>
          {flights.map((flight) => (
            <li key={flight.id}>
              ✈️ <strong>{flight.aircraft?.airlineName || "Unknown Airline"}</strong>  
              from <strong>{flight.departureAirport?.name || "Unknown"}</strong>  
              to <strong>{flight.arrivalAirport?.name || "Unknown"}</strong><br />
              Gate: {flight.gate?.code || "TBD"} | Type: {flight.aircraft?.type || "Unknown"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Admin;
