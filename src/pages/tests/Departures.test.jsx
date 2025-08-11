import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

  it('renders loading text, then displays flight info for selected airport', async () => {
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

    render(
      <MemoryRouter initialEntries={['/departures?airportId=123']}>
        <Departures />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading departures/i)).toBeInTheDocument();

    const items = await screen.findAllByRole('listitem');
    expect(items.length).toBeGreaterThan(0);

    expect(screen.getByText(/air canada/i)).toBeInTheDocument();
    expect(screen.getByText(/toronto pearson/i)).toBeInTheDocument();

    // verify correct endpoint + params
    expect(api.get).toHaveBeenCalledWith('/departures', { params: { airportId: '123' } });
  });

  it('shows an error state when the API fails', async () => {
    api.get.mockRejectedValueOnce(new Error('boom'));

    render(
      <MemoryRouter initialEntries={['/departures?airportId=123']}>
        <Departures />
      </MemoryRouter>
    );

    expect(await screen.findByText(/error fetching departures/i)).toBeInTheDocument();
  });
});
