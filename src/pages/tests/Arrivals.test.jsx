import { render, screen } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import Arrivals from '../Arrivals';

vi.mock('../../services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
import api from '../../services/api';

describe('Arrivals Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading text, then displays flight info', async () => {
    const mockFlights = [
      {
        id: 1,
        aircraft: { airlineName: 'Test Airline', type: 'A320' },
        departureAirport: { name: 'Toronto Pearson' },
        arrivalAirport: { name: "St. John's Intl" },
        gate: { code: 'A1' },
      },
    ];
    api.get.mockResolvedValueOnce({ data: mockFlights });

    render(<Arrivals />);

    expect(screen.getByText(/loading arrivals/i)).toBeInTheDocument();

    const listItems = await screen.findAllByRole('listitem');
    expect(listItems.length).toBe(1);
    expect(screen.getByText(/test airline/i)).toBeInTheDocument();
    expect(screen.getByText(/toronto pearson/i)).toBeInTheDocument();
  });
});
