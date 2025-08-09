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
    departureAirport: { name: 'Toronto Pearson' },
    arrivalAirport: { name: "St. John's Intl" },
    gate: { code: 'A1' },
  },
];
const mockGates = [{ id: 1, code: 'A1' }, { id: 2, code: 'B2' }];
const mockAirports = [{ id: 1, name: "St. John's Intl" }, { id: 2, name: 'Toronto Pearson' }];

describe('Admin Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Each initial render triggers three GETs. Keep it simple and branch on URL.
    api.get.mockImplementation((url) => {
      if (url === '/flights')  return Promise.resolve({ data: mockFlights });
      if (url === '/gates')    return Promise.resolve({ data: mockGates });
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

    // airports list item text is split by elements, so check within the list
    const airportsList = await screen.findByTestId('airports-list');
    const items = within(airportsList).getAllByRole('listitem');
    expect(items.some(li => /St\. John's Intl/i.test(li.textContent || ''))).toBe(true);

    expect(api.get).toHaveBeenCalledWith('/flights');
    expect(api.get).toHaveBeenCalledWith('/gates');
    expect(api.get).toHaveBeenCalledWith('/airports');
  });

  it('creates a new flight (POST /flights)', async () => {
    render(<Admin />);

    // After POST, component refetches flights — stub both calls
    api.post.mockResolvedValueOnce({ data: {} });
    api.get.mockResolvedValueOnce({ data: mockFlights }); // refresh after POST

    fireEvent.change(screen.getByPlaceholderText(/Airline Name/i), { target: { value: 'Test Airline' }});
    fireEvent.change(screen.getByPlaceholderText(/Aircraft Type/i), { target: { value: 'A321' }});
    fireEvent.change(screen.getByPlaceholderText(/Departure Airport/i), { target: { value: 'Toronto Pearson' }});
    fireEvent.change(screen.getByPlaceholderText(/Arrival Airport/i), { target: { value: "St. John's Intl" }});
    fireEvent.change(screen.getByTestId('flight-gateCode'), { target: { value: 'B2' }});

    fireEvent.click(screen.getByText(/Add Flight/i));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        '/flights',
        expect.objectContaining({
          aircraft: { airlineName: 'Test Airline', type: 'A321' },
          departureAirport: { name: 'Toronto Pearson' },
          arrivalAirport: { name: "St. John's Intl" },
          gate: { code: 'B2' },
        })
      )
    );
  });

  it('creates a new gate (POST /gates)', async () => {
    render(<Admin />);

    api.post.mockResolvedValueOnce({ data: {} });
    api.get.mockResolvedValueOnce({ data: mockGates }); // refresh after POST

    fireEvent.change(screen.getByTestId('gate-code'), { target: { value: 'C3' }});
    fireEvent.click(screen.getByText(/Add Gate/i));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/gates', { code: 'C3' })
    );
  });

  it('creates a new airport (POST /airports)', async () => {
    render(<Admin />);

    api.post.mockResolvedValueOnce({ data: {} });
    api.get.mockResolvedValueOnce({ data: mockAirports }); // refresh after POST

    const airportInput = screen.getByPlaceholderText(/Airport Name/i);
    fireEvent.change(airportInput, { target: { value: 'Halifax' }});
    fireEvent.click(screen.getByText(/Add Airport/i));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/airports', { name: 'Halifax' })
    );
  });

  it('deletes a gate (DELETE /gates/:id)', async () => {
    render(<Admin />);

    api.delete.mockResolvedValueOnce({ data: {} });
    api.get.mockResolvedValueOnce({ data: mockGates }); // refresh after DELETE

    const gatesList = await screen.findByTestId('gates-list');
    const deleteButtons = within(gatesList).getAllByText(/Delete/i);
    fireEvent.click(deleteButtons[0]); // deletes id:1

    await waitFor(() =>
      expect(api.delete).toHaveBeenCalledWith('/gates/1')
    );
  });
});
