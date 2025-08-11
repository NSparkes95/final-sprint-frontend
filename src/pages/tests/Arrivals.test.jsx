import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import Arrivals from '../Arrivals';

// mock the shared API client
vi.mock('../../services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
import api from '../../services/api';

// reuse the same sample flight(s)
import { mockFlights } from '../../__mocks__/mockData';

describe('Arrivals Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading text, then displays flight info for selected airport', async () => {
    // Arrivals now fetches /arrivals with ?airportId=...
    api.get.mockResolvedValueOnce({ data: mockFlights });

    render(
      <MemoryRouter initialEntries={['/?airportId=123']}>
        <Arrivals />
      </MemoryRouter>
    );

    // shows loading first
    expect(screen.getByText(/loading arrivals/i)).toBeInTheDocument();

    // then renders list items from mockFlights
    const items = await screen.findAllByRole('listitem');
    expect(items.length).toBeGreaterThan(0);

    // a couple of sanity checks against our mock data
    expect(screen.getByText(/air canada/i)).toBeInTheDocument();
    expect(screen.getByText(/st\. john's intl/i)).toBeInTheDocument();

    // ensure API is called with correct endpoint + params
    expect(api.get).toHaveBeenCalledWith('/arrivals', { params: { airportId: '123' } });
  });

  it('shows an error state if the API call fails', async () => {
    api.get.mockRejectedValueOnce(new Error('boom'));

    render(
      <MemoryRouter initialEntries={['/?airportId=123']}>
        <Arrivals />
      </MemoryRouter>
    );

    expect(await screen.findByText(/error fetching arrivals/i)).toBeInTheDocument();
  });
});
