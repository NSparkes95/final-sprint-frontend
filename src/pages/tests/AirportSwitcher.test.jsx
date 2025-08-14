import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, beforeEach, expect } from "vitest";
import AirportSwitcher from "../../components/AirportSwitcher";

// API mock
vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn((url) => {
      if (url === "/airports") {
        return Promise.resolve({
          data: [
            { id: 1, name: "St. John's Intl", code: "YYT" },
            { id: 2, name: "Toronto Pearson", code: "YYZ" },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    }),
  },
}));

describe("AirportSwitcher", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders airport options and remembers selection", async () => {
    render(
      <MemoryRouter initialEntries={["/?airportId=1"]}>
        <AirportSwitcher />
      </MemoryRouter>
    );

    const sel =
      (await screen.findByRole("combobox")) ||
      (await screen.findByLabelText(/airport:/i));

    // change to airport id 2
    fireEvent.change(sel, { target: { value: "2" } });

    // MemoryRouter doesn't change window.location; assert UI state
    expect(sel).toHaveValue("2");
  });
});
