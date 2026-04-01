import { describe, expect, it, beforeEach } from "@jest/globals";
import { render, renderHook, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import { makeTestJwt } from "@/lib/__tests__/testJwt";

function TestConsumer() {
  const { user, isAuthenticated, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth">{isAuthenticated ? "yes" : "no"}</span>
      <span data-testid="email">{user?.email ?? ""}</span>
      <button type="button" onClick={logout}>
        out
      </button>
    </div>
  );
}

describe("useAuth", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("lève hors AuthProvider", () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within AuthProvider");
  });

  it("fournit isAuthenticated false par défaut", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId("auth")).toHaveTextContent("no");
  });

  it("login met à jour user et logout efface", () => {
    const token = makeTestJwt({ id: "1", email: "u@test.com", name: "U" });
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    act(() => {
      result.current.login(token);
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe("u@test.com");

    act(() => {
      result.current.logout();
    });
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("login avec token invalide laisse user null", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    act(() => {
      result.current.login("bad.token.here");
    });
    expect(result.current.user).toBeNull();
  });
});
