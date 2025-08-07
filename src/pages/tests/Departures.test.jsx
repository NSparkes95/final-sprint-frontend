import { render, screen } from '@testing-library/react';
import Departures from '../Departures';
import { vi } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('Departures Component', () => {
  it('renders loading text, then displays flight info', async () => {
    const mockFlights = [
      {
        id: 1,
        departureAirport: { name: "St. John's Intl" }, 
        arrivalAirport: { name: 'Toronto Pearson' },
        aircraft: { airlineName: 'Air Canada', type: 'Boeing 737' },
        gate: { code: 'A1' }
      }
    ];

    axios.get.mockResolvedValueOnce({ data: mockFlights });

    render(<Departures />);

    expect(screen.getByText(/loading departures/i)).toBeInTheDocument();

    const listItems = await screen.findAllByRole('listitem');
    expect(listItems.length).toBe(1);

    expect(screen.getByText(/air canada/i)).toBeInTheDocument();
    expect(screen.getByText(/toronto pearson/i)).toBeInTheDocument();
  });
});
