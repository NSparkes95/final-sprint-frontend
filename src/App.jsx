import { Routes, Route, Link } from "react-router-dom";
import Arrivals from "./pages/Arrivals";
import Departures from "./pages/Departures";
import Admin from "./pages/Admin";

function App() {
  return (
    <div>
      <h1>Cleared Flights</h1>
      <nav>
        <Link to="/">Arrivals</Link> |{" "}
        <Link to="/departures">Departures</Link> |{" "}
        <Link to="/admin">Admin</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Arrivals />} />
        <Route path="/departures" element={<Departures />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;
