/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { readInitialUserFromStorage } from "../authSession";

describe("readInitialUserFromStorage (Node, sans window)", () => {
  it("retourne null côté SSR", () => {
    expect(readInitialUserFromStorage()).toBeNull();
  });
});
