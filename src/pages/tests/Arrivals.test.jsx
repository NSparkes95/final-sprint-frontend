import { render, screen } from '@testing-library/react';
import Arrivals from '../Arrivals';
import { vi } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('Arrivals Component', () => {
  it('renders loading text, then displays flight info', async () => {
    const mockFlights = [
      {
        id: 1,
        aircraft: { airlineName: 'Test Airline', type: 'A320' },
        departureAirport: { name: 'Toronto Pearson' },
        arrivalAirport: { name: "St. John's Intl" },
        gate: { code: 'A1' }
      }
    ];

    axios.get.mockResolvedValueOnce({ data: mockFlights });

    render(<Arrivals />);

    expect(screen.getByText(/loading arrivals/i)).toBeInTheDocument();

    const listItems = await screen.findAllByRole('listitem');
    expect(listItems.length).toBe(1);

    expect(screen.getByText(/test airline/i)).toBeInTheDocument();
    expect(screen.getByText(/toronto pearson/i)).toBeInTheDocument();
  });
});
