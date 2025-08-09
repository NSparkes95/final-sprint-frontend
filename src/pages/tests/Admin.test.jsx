import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import Admin from '../Admin';

vi.mock('../../services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
import api from '../../services/api';

const mockFlights = [
  {
    id: 1,
    aircraft: { airlineName: 'Air Canada', type: 'A320' },
    departureAirport: { name: 'Toronto Pearson' },
    arrivalAirport: { name: "St. John's Intl" },
    gate: { code: 'A1' },
  },
];
const mockGates = [{ id: 1, code: 'A1' }, { id: 2, code: 'B2' }];
const mockAirports = [
  { id: 1, name: "St. John's Intl" },
  { id: 2, name: 'Toronto Pearson' },
];

describe('Admin Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    api.get.mockImplementation((url) => {
      if (url === '/flights') return Promise.resolve({ data: mockFlights });
      if (url === '/gates') return Promise.resolve({ data: mockGates });
      if (url === '/airports') return Promise.resolve({ data: mockAirports });
      return Promise.resolve({ data: [] });
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders sections and initial data without network errors', async () => {
    render(<Admin />);

    // flights present
    await screen.findByText(/Air Canada/i);
    await screen.findByText(/Gate:\s*A1/i);

    // airports present
    const airportsList = await screen.findByTestId('airports-list');
    const items = within(airportsList).getAllByRole('listitem');
    expect(items.some(li => /St\. John's Intl/i.test(li.textContent || ''))).toBe(true);

    expect(api.get).toHaveBeenCalledWith('/flights');
    expect(api.get).toHaveBeenCalledWith('/gates');
    expect(api.get).toHaveBeenCalledWith('/airports');
  });

  it('creates a new flight (POST /flights)', async () => {
    render(<Admin />);

    fireEvent.change(screen.getByPlaceholderText(/Airline Name/i), { target: { value: 'Test Airline' } });
    fireEvent.change(screen.getByPlaceholderText(/Aircraft Type/i), { target: { value: 'A321' } });
    fireEvent.change(screen.getByPlaceholderText(/Departure Airport/i), { target: { value: 'Toronto Pearson' } });
    fireEvent.change(screen.getByPlaceholderText(/Arrival Airport/i), { target: { value: "St. John's Intl" } });
    fireEvent.change(screen.getByTestId('flight-gateCode'), { target: { value: 'B2' } });

    fireEvent.click(screen.getByText(/Add Flight/i));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/flights',
        expect.objectContaining({ gate: { code: 'B2' } })
      );
    });
  });

  it('creates a new gate (POST /gates)', async () => {
    render(<Admin />);
    fireEvent.change(screen.getByTestId('gate-code'), { target: { value: 'C3' } });
    fireEvent.click(screen.getByText(/Add Gate/i));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/gates', { code: 'C3' });
    });
  });

  it('creates a new airport (POST /airports)', async () => {
    render(<Admin />);
    const airportInput = screen.getByPlaceholderText(/Airport Name/i);
    fireEvent.change(airportInput, { target: { value: 'Halifax' } });
    fireEvent.click(screen.getByText(/Add Airport/i));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/airports', { name: 'Halifax' });
    });
  });

  it('deletes a gate (DELETE /gates/:id)', async () => {
    render(<Admin />);

    const gatesList = await screen.findByTestId('gates-list');
    const deleteButtons = within(gatesList).getAllByText(/Delete/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/gates/1');
    });
  });
});
