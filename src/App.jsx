import { Routes, Route, Link } from "react-router-dom";
import Arrivals from "./pages/Arrivals";
import Departures from "./pages/Departures";
import Admin from "./pages/Admin";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import AirportSwitcher from "./components/AirportSwitcher";

function App() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Cleared Flights</h1>

      <nav style={{ marginBottom: 8 }}>
        <Link to="/" style={{ marginRight: 10 }}>Arrivals</Link> |{" "}
        <Link to="/departures" style={{ margin: "0 10px" }}>Departures</Link> |{" "}
        <Link to="/admin" style={{ marginLeft: 10 }}>Admin</Link>
      </nav>

      <AirportSwitcher /> {/* NEW */}

      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Arrivals />} />
          <Route path="/departures" element={<Departures />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
}
export default App;
