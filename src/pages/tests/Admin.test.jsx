import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import Admin from '../Admin';

// Mock the shared API client that the app uses
vi.mock('../../services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
import api from '../../services/api';

const mockFlights = [
  {
    id: 1,
    aircraft: { airlineName: 'Air Canada', type: 'A320' },
    departureAirport: { name: 'Toronto Pearson', id: 2 },
    arrivalAirport: { name: "St. John's Intl", id: 1 },
    gate: { code: 'A1', id: 1 },
  },
];

const mockAirports = [
  { id: 1, name: "St. John's Intl" },
  { id: 2, name: 'Toronto Pearson' },
];

const mockGates = [
  { id: 1, code: 'A1', airportId: 1 },
  { id: 2, code: 'B2', airportId: 1 },
];

describe('Admin Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Initial GETs for the Admin page
    api.get.mockImplementation((url) => {
      if (url === '/flights' || url === '/flight') return Promise.resolve({ data: mockFlights });
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

    // "Gate A1" text is split across elements; check inside the list container
    const gatesList = await screen.findByTestId('gates-list');
    expect(within(gatesList).getByText(/\bA1\b/)).toBeInTheDocument();

    // airports list item text is split by elements, so check within the list
    const airportsList = await screen.findByTestId('airports-list');
    const items = within(airportsList).getAllByRole('listitem');
    expect(items.some(li => /St\. John's Intl/i.test(li.textContent || ''))).toBe(true);

    expect(api.get).toHaveBeenCalledWith('/flights');
    expect(api.get).toHaveBeenCalledWith('/gates');
    expect(api.get).toHaveBeenCalledWith('/airports');
  });

  it('creates a new flight (POST /flight)', async () => {
    render(<Admin />);

    // After POST, component likely refetches flights — stub both calls
    api.post.mockResolvedValueOnce({ data: {} });
    api.get.mockResolvedValueOnce({ data: mockFlights }); // refresh after POST

    // Text inputs are found by placeholder
    fireEvent.change(await screen.findByPlaceholderText(/Airline Name/i), { target: { value: 'Test Airline' } });
    fireEvent.change(screen.getByPlaceholderText(/Aircraft Type/i), { target: { value: 'A321' } });

    // Airports & gate are <select> controls; select by label and option value (ID)
    const dep = screen.getByLabelText(/Departure:/i);
    const arr = screen.getByLabelText(/Arrival:/i);
    const gate = screen.getByTestId('flight-gateCode');

    // Toronto Pearson (id 2) -> St. John's Intl (id 1), gate B2 (id 2)
    fireEvent.change(dep, { target: { value: '2' } });
    fireEvent.change(arr, { target: { value: '1' } });
    fireEvent.change(gate, { target: { value: '2' } });

    fireEvent.click(screen.getByRole('button', { name: /add flight/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/flight',
        expect.objectContaining({
          aircraft: expect.objectContaining({
            airlineName: 'Test Airline',
            type: 'A321',
          }),
          departureAirport: expect.objectContaining({ id: 2 }),
          arrivalAirport: expect.objectContaining({ id: 1 }),
          gate: expect.objectContaining({ id: 2 }),
        })
      );
    });
  });

  it('creates a new gate (POST /gates)', async () => {
    render(<Admin />);

    api.post.mockResolvedValueOnce({ data: {} });
    api.get.mockResolvedValueOnce({ data: mockGates }); // refresh after POST

    fireEvent.change(await screen.findByTestId('gate-code'), { target: { value: 'C3' } });

    // Must select an airport for the gate to satisfy validation
    const gateAirport = screen.getByLabelText(/Airport:/i);
    fireEvent.change(gateAirport, { target: { value: '1' } });

    fireEvent.click(screen.getByRole('button', { name: /add gate/i }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        '/gates',
        { code: 'C3', airport: { id: 1 } }
      )
    );
  });

  it('creates a new airport (POST /airports)', async () => {
    render(<Admin />);

    api.post.mockResolvedValueOnce({ data: {} });
    api.get.mockResolvedValueOnce({ data: mockAirports }); // refresh after POST

    const airportInput = await screen.findByPlaceholderText(/Airport Name/i);
    fireEvent.change(airportInput, { target: { value: 'Halifax' } });
    fireEvent.click(screen.getByRole('button', { name: /add airport/i }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/airports', { name: 'Halifax' })
    );
  });

  it('deletes a gate (DELETE /gates/:id)', async () => {
    render(<Admin />);

    api.delete.mockResolvedValueOnce({ data: {} });
    api.get.mockResolvedValueOnce({ data: mockGates }); // refresh after DELETE

    const gatesList = await screen.findByTestId('gates-list');
    const deleteButtons = within(gatesList).getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]); // deletes id:1

    await waitFor(() =>
      expect(api.delete).toHaveBeenCalledWith('/gates/1')
    );
  });
});
