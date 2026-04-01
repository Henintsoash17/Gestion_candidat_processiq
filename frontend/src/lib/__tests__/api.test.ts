import { describe, expect, it, beforeEach, jest } from "@jest/globals";

jest.mock("axios");

import { axiosMockClient } from "axios";
import { authAPI, candidatesAPI, extractAuthToken } from "../api";

const getInterceptor = () => {
  return axiosMockClient.interceptors.request.use.mock.calls[0][0] as (config: {
    headers?: Record<string, string>;
  }) => { headers?: Record<string, string> };
};

describe("extractAuthToken", () => {
  it("extrait token à la racine", () => {
    expect(extractAuthToken({ token: "abc" })).toBe("abc");
  });

  it("extrait token dans data", () => {
    expect(extractAuthToken({ data: { token: "nested" } })).toBe("nested");
  });

  it("retourne undefined si absent ou type invalide", () => {
    expect(extractAuthToken(null)).toBeUndefined();
    expect(extractAuthToken(undefined)).toBeUndefined();
    expect(extractAuthToken("x")).toBeUndefined();
    expect(extractAuthToken({})).toBeUndefined();
    expect(extractAuthToken({ token: 1 })).toBeUndefined();
    expect(extractAuthToken({ data: { token: 1 } })).toBeUndefined();
  });
});

describe("client axios", () => {
  beforeEach(() => {
    localStorage.clear();
    axiosMockClient.get.mockClear();
    axiosMockClient.post.mockClear();
    axiosMockClient.put.mockClear();
    axiosMockClient.delete.mockClear();
  });

  it("interceptor ajoute Authorization si token présent", () => {
    localStorage.setItem("token", "myjwt");
    const config: { headers?: Record<string, string> } = { headers: {} };
    const out = getInterceptor()(config);
    expect(out).toBe(config);
    expect(config.headers?.Authorization).toBe("Bearer myjwt");
  });

  it("interceptor ne modifie pas sans token", () => {
    const config: { headers?: Record<string, string> } = { headers: {} };
    getInterceptor()(config);
    expect(config.headers?.Authorization).toBeUndefined();
  });

  it("candidatesAPI.getAll construit la query", async () => {
    axiosMockClient.get.mockResolvedValue({ data: { candidates: [], total: 0 } });
    await candidatesAPI.getAll(2, 10, { search: "x", status: "pending" });
    expect(axiosMockClient.get).toHaveBeenCalledWith(expect.stringContaining("page=2"));
    expect(axiosMockClient.get).toHaveBeenCalledWith(expect.stringContaining("limit=10"));
    expect(axiosMockClient.get).toHaveBeenCalledWith(expect.stringContaining("status=pending"));
    expect(axiosMockClient.get).toHaveBeenCalledWith(expect.stringContaining("search=x"));
  });

  it("candidatesAPI.getAll sans filtres optionnels", async () => {
    axiosMockClient.get.mockResolvedValue({ data: { candidates: [], total: 0 } });
    await candidatesAPI.getAll();
    expect(axiosMockClient.get).toHaveBeenCalledWith("/candidates?page=1&limit=10");
  });

  it("candidatesAPI.getById", async () => {
    axiosMockClient.get.mockResolvedValue({ data: {} });
    await candidatesAPI.getById("id1");
    expect(axiosMockClient.get).toHaveBeenCalledWith("/candidates/id1");
  });

  it("candidatesAPI.create / update / delete", async () => {
    axiosMockClient.post.mockResolvedValue({ data: {} });
    axiosMockClient.put.mockResolvedValue({ data: {} });
    axiosMockClient.delete.mockResolvedValue({ data: {} });
    await candidatesAPI.create({ name: "a", email: "a@a.com" });
    expect(axiosMockClient.post).toHaveBeenCalledWith("/candidates", {
      name: "a",
      email: "a@a.com",
    });
    await candidatesAPI.update("1", { name: "b" });
    expect(axiosMockClient.put).toHaveBeenCalledWith("/candidates/1", {
      name: "b",
    });
    await candidatesAPI.delete("1");
    expect(axiosMockClient.delete).toHaveBeenCalledWith("/candidates/1");
  });

  it("candidatesAPI.validate et reject", async () => {
    axiosMockClient.post.mockResolvedValue({ data: {} });
    await candidatesAPI.validate("v1");
    expect(axiosMockClient.post).toHaveBeenCalledWith("/candidates/v1/validate");
    await candidatesAPI.reject("r1");
    expect(axiosMockClient.post).toHaveBeenCalledWith("/candidates/r1/reject");
  });

  it("authAPI.register et login", async () => {
    axiosMockClient.post.mockResolvedValue({ data: {} });
    await authAPI.register({
      email: "a@a.com",
      password: "secret12",
      name: "A",
    });
    expect(axiosMockClient.post).toHaveBeenCalledWith("/auth/register", {
      email: "a@a.com",
      password: "secret12",
      name: "A",
    });
    await authAPI.login({ email: "a@a.com", password: "secret12" });
    expect(axiosMockClient.post).toHaveBeenCalledWith("/auth/login", {
      email: "a@a.com",
      password: "secret12",
    });
  });
});
