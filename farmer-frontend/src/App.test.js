import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the AgriN Connect dashboard", () => {
  render(<App />);
  expect(screen.getByText(/Welcome to AgriN Connect/i)).toBeInTheDocument();
});
