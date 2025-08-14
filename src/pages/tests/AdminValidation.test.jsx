import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, test, beforeEach, expect } from 'vitest';
import Admin from '../Admin';

vi.mock('../../services/api', () => {
  const get = vi.fn((url) => {
    if (/airports|gates|aircraft|flights/i.test(url)) return Promise.resolve({ data: [] });
    return Promise.resolve({ data: [] });
  });
  return { default: { get, post: vi.fn(), put: vi.fn(), delete: vi.fn() } };
});
import api from '../../services/api';

beforeEach(() => vi.clearAllMocks());

test('cannot submit new flight until the form is valid', async () => {
  render(
    <MemoryRouter>
      <Admin />
    </MemoryRouter>
  );

  // Wait for Admin’s initial effects to settle (prevents act warnings)
  await screen.findByTestId('flight-form'); // ensure Admin has data-testid="flight-form"

  // Tolerant button lookup
  const addBtn =
    screen.queryByRole('button', { name: /add new flight/i }) ||
    screen.queryByRole('button', { name: /add flight/i }) ||
    screen.queryByRole('button', { name: /save flight/i });

  expect(addBtn).toBeTruthy();

  // Try to submit with empty form
  fireEvent.click(addBtn);

  // Should NOT submit
  expect(api.post).not.toHaveBeenCalled();
});
