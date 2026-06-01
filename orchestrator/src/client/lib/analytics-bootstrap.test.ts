import { beforeEach, describe, expect, it } from "vitest";
import { initializeAnalyticsRuntime } from "./analytics-bootstrap";

describe("initializeAnalyticsRuntime", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    delete (window as Window & { op?: unknown }).op;
  });

  it("skips remote analytics loads on localhost", () => {
    initializeAnalyticsRuntime("localhost");

    expect(window.op).toBeDefined();
    expect(
      document.head.querySelector('script[src="https://umami.dakheera47.com/script.js"]'),
    ).toBeNull();
    expect(
      document.head.querySelector('script[src="https://openpanel.dev/op1.js"]'),
    ).toBeNull();
  });

  it("loads analytics assets and queues OpenPanel initialization off localhost", () => {
    initializeAnalyticsRuntime("app.example.com");

    expect(
      document.head.querySelector('script[src="https://umami.dakheera47.com/script.js"]'),
    ).toBeTruthy();
    expect(
      document.head.querySelector('script[src="https://openpanel.dev/op1.js"]'),
    ).toBeTruthy();
    expect(window.op).toBeTypeOf("function");

    const openPanelProxy = window.op as ((command: string, ...args: unknown[]) => void) & {
      q?: unknown[][];
    };

    expect(openPanelProxy.q).toBeDefined();
    expect(openPanelProxy.q).toEqual([
      ["init", expect.objectContaining({ apiUrl: "https://openpanel.dakheera47.com/api" })],
    ]);
  });
});
