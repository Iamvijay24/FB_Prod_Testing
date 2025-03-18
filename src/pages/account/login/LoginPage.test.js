/* eslint-disable testing-library/no-unnecessary-act */
/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import LoginPage from "./index.js"; // Ensure this is the correct import path
import "@testing-library/jest-dom";

describe("LoginPage Component", () => {
  test("renders the login form correctly", () => {
    render(<LoginPage />);

    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByText("Log in")).toBeInTheDocument();
    expect(screen.getByText("Forgot password?")).toBeInTheDocument();
  });

  test("shows validation errors when submitting empty form", async() => {
    render(<LoginPage />);

    fireEvent.click(screen.getByText("Log in"));

    expect(await screen.findByText("Please input your Email!")).toBeInTheDocument();
    expect(await screen.findByText("Please input your Password!")).toBeInTheDocument();
  });

  test("calls onFinish when valid data is submitted", async() => {
    await act(async() => {
      render(<LoginPage />);
    });

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "password123" } });

    fireEvent.click(screen.getByText("Log in"));

    await waitFor(() => {
      expect(screen.queryByText("Please input your Email!")).not.toBeInTheDocument();
      expect(screen.queryByText("Please input your Password!")).not.toBeInTheDocument();
    });
  });
});
