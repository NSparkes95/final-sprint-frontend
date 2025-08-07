import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

function Dummy() {
  return <h1>Hello World</h1>;
}

describe('Dummy Component', () => {
  it("renders hello world text", () => {
    render(<Dummy />);
    expect(screen.getByText(/hello world/i)).toBeInTheDocument();
  });
});
