import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import Arrivals from '../Arrivals';

vi.mock('../../services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
import api from '../../services/api';

describe('Arrivals Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Return flights from /flights with the nested shape the component filters on
    api.get.mockImplementation((raw) => {
      if (raw === '/flights') {
        return Promise.resolve({
          data: [
            {
              id: 1,
              arrivalAirport: { id: '123', name: "St. John's Intl" },
              departureAirport: { name: 'Toronto Pearson' },
              aircraft: { airlineName: 'Air Canada', type: 'A320' },
              gate: { code: 'A1' },
              status: 'On Time',
            },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    });
  });

  afterEach(() => vi.clearAllMocks());

  it('renders loading text, then displays flight info for selected airport', async () => {
    render(
      <MemoryRouter initialEntries={['/arrivals?airportId=123']}>
        <Arrivals />
      </MemoryRouter>
    );

    // Loading first
    expect(screen.getByText(/loading arrivals/i)).toBeInTheDocument();

    // Then the data
    expect(await screen.findByText(/air canada/i)).toBeInTheDocument();
    expect(screen.getByText(/toronto pearson/i)).toBeInTheDocument();
    expect(screen.getByText(/st\. john's intl/i)).toBeInTheDocument();

    // <li role="listitem"> exists
    const items = await screen.findAllByRole('listitem');
    expect(items.length).toBeGreaterThan(0);

    // The component calls /flights without params
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/flights');
    });
  });

  it('shows an error state if the API call fails', async () => {
    api.get.mockRejectedValueOnce(new Error('boom'));

    render(
      <MemoryRouter initialEntries={['/arrivals?airportId=123']}>
        <Arrivals />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/error fetching arrivals\. please try again later\./i)
    ).toBeInTheDocument();
  });
});
