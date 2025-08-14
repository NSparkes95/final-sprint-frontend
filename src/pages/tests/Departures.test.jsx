import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import Departures from '../Departures';

vi.mock('../../services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
import api from '../../services/api';

describe('Departures Component', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.clearAllMocks());

  it('renders loading text, then displays flight info for selected airport', async () => {
    const mockDepartures = [
      {
        id: 99,
        aircraft: { airlineName: 'Air Canada', type: 'A320' },
        departureAirport: { id: '123', name: "St. John's Intl" },
        arrivalAirport: { name: 'Toronto Pearson' },
        gate: { code: 'A1' },
        status: 'On Time',
      },
    ];

    // Component calls /flights (no params)
    api.get.mockResolvedValueOnce({ data: mockDepartures });

    render(
      <MemoryRouter initialEntries={['/departures?airportId=123']}>
        <Departures />
      </MemoryRouter>
    );

    // Loading
    expect(screen.getByText(/loading departures/i)).toBeInTheDocument();

    // Data shows up
    expect(await screen.findByText(/air canada/i)).toBeInTheDocument();
    expect(screen.getByText(/toronto pearson/i)).toBeInTheDocument();

    // There should be list items
    const items = await screen.findAllByRole('listitem');
    expect(items.length).toBeGreaterThan(0);

    // Verify the endpoint used by the component
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/flights');
    });
  });

  it('shows an error state when the API fails', async () => {
    api.get.mockRejectedValueOnce(new Error('boom'));

    render(
      <MemoryRouter initialEntries={['/departures?airportId=123']}>
        <Departures />
      </MemoryRouter>
    );

    // Component renders this exact message
    expect(
      await screen.findByText(/error fetching departures\. please try again later\./i)
    ).toBeInTheDocument();
  });
});
