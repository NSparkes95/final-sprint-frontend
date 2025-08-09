import { render, screen } from '@testing-library/react';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import Departures from '../Departures';

vi.mock('../../services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
import api from '../../services/api';

describe('Departures Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading text, then displays flight info', async () => {
    // Make sure the departure is FROM St. John’s so it passes the component’s filter
    const mockDepartures = [
      {
        id: 99,
        aircraft: { airlineName: 'Air Canada', type: 'A320' },
        departureAirport: { name: "St. John's Intl" },
        arrivalAirport: { name: 'Toronto Pearson' },
        gate: { code: 'A1' },
      },
    ];
    api.get.mockResolvedValueOnce({ data: mockDepartures });

    render(<Departures />);

    expect(screen.getByText(/loading departures/i)).toBeInTheDocument();

    const items = await screen.findAllByRole('listitem');
    expect(items.length).toBeGreaterThan(0);

    expect(screen.getByText(/air canada/i)).toBeInTheDocument();
    expect(screen.getByText(/toronto pearson/i)).toBeInTheDocument();
  });
});
