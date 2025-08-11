export function normalizeFlight(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const id = raw.id ?? raw.flightId ?? raw._id ?? null;

  const aircraft = raw.aircraft ?? {
    airlineName: raw.airlineName ?? raw.airline ?? raw.carrier ?? 'Unknown Airline',
    type: raw.type ?? raw.aircraftType ?? 'Unknown',
  };

  const departureAirport =
    raw.departureAirport ??
    raw.departure ??
    (raw.from ? { name: raw.from } : null) ??
    null;

  const arrivalAirport =
    raw.arrivalAirport ??
    raw.arrival ??
    (raw.to ? { name: raw.to } : null) ??
    null;

  const gate =
    raw.gate ??
    (raw.gateCode ? { code: raw.gateCode } : null) ??
    null;

  return {
    id,
    aircraft: {
      airlineName: aircraft?.airlineName ?? 'Unknown Airline',
      type: aircraft?.type ?? 'Unknown',
    },
    departureAirport: {
      name: departureAirport?.name ?? 'Unknown',
    },
    arrivalAirport: {
      name: arrivalAirport?.name ?? 'Unknown',
    },
    gate: {
      code: gate?.code ?? 'TBD',
    },
  };
}

export function normalizeGate(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.id ?? raw.gateId ?? raw._id ?? null,
    code: raw.code ?? raw.gateCode ?? String(raw),
  };
}

export function normalizeAirport(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.id ?? raw.airportId ?? raw._id ?? null,
    name: raw.name ?? raw.airportName ?? String(raw),
    code: raw.code ?? raw.airportCode ?? raw.iata ?? raw.icao ?? '', // NEW
  };
}