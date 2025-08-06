import React, { useEffect, useState } from "react";
import axios from "axios";

const Admin = () => {
  const [flights, setFlights] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/flights")
      .then((response) => {
        setFlights(response.data);
      })
      .catch((error) => {
        console.error("Error fetching flights:", error);
      });
  }, []);

  return (
    <div>
      <h2>Admin Panel – All Flights</h2>
      {flights.length === 0 ? (
        <p>No flights found.</p>
      ) : (
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