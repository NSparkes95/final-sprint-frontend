import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Admin from "../Admin";

describe("Admin Component", () => {
  it("renders Admin title", () => {
    render(<Admin />);
    expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument();
  });

  it("renders flight form fields", () => {
    render(<Admin />);
    expect(screen.getByPlaceholderText(/Airline Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Aircraft Type/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Departure Airport/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Arrival Airport/i)).toBeInTheDocument();
    
    const gateCodeInputs = screen.getAllByPlaceholderText(/Gate Code/i);
    expect(gateCodeInputs.length).toBeGreaterThanOrEqual(2);
  });

  it("renders flight form buttons", () => {
    render(<Admin />);
    expect(screen.getByText(/Add Flight/i)).toBeInTheDocument();
  });

  it("renders gate section title", () => {
    render(<Admin />);
    expect(screen.getByText(/Manage Gates/i)).toBeInTheDocument();
  });

  it("renders gate form input and button", () => {
    render(<Admin />);
    expect(screen.getAllByPlaceholderText(/Gate Code/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/Add Gate/i)).toBeInTheDocument();
  });

  it("renders airport section title", () => {
    render(<Admin />);
    expect(screen.getByText(/Manage Airports/i)).toBeInTheDocument();
  });

  it("renders airport form input and button", () => {
    render(<Admin />);
    expect(screen.getByPlaceholderText(/Airport Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Airport/i)).toBeInTheDocument();
  });
});
