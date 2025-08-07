import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Arrivals from '../Arrivals';

vi.mock('axios');

describe('Arrivals Component', () => {
  it('renders loading text, then displays flight info', async () => {
    const mockFlights = [
      {
        id: 1,
        aircraft: { airlineName: 'Test Airline', type: 'A320' },
        departureAirport: { name: 'Toronto Pearson' },
        arrivalAirport: { name: "St. John's Intl" }, // Must match filter
        gate: { code: 'A1' }
      }
    ];

    axios.get.mockResolvedValueOnce({ data: mockFlights });

    render(<Arrivals />);

    // Initial loading message
    expect(screen.getByText(/loading arrivals/i)).toBeInTheDocument();

    // Wait for the list item to appear
    const listItems = await screen.findAllByRole('listitem');
    expect(listItems.length).toBeGreaterThan(0);

    // Confirm content
    expect(screen.getByText(/test airline/i)).toBeInTheDocument();
    expect(screen.getByText(/toronto pearson/i)).toBeInTheDocument();
    expect(screen.getByText(/a320/i)).toBeInTheDocument();
  });
});
