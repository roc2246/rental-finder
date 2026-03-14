import { afterEach, describe, expect, it, vi } from "vitest";

async function loadServer({ port, dbError, hasClientBuild = true } = {}) {
  vi.resetModules();

  if (typeof port === "undefined") {
    delete process.env.PORT;
  } else {
    process.env.PORT = String(port);
  }

  const app = {
    use: vi.fn(),
    get: vi.fn(),
    listen: vi.fn((listenPort, cb) => {
      cb?.();
      return { close: vi.fn() };
    }),
  };

  const expressMock = vi.fn(() => app);
  const jsonMiddleware = Symbol("jsonMiddleware");
  const staticMiddleware = Symbol("staticMiddleware");
  expressMock.json = vi.fn(() => jsonMiddleware);
  expressMock.static = vi.fn(() => staticMiddleware);
  const existsSync = vi.fn().mockReturnValue(hasClientBuild);

  const dotenvConfig = vi.fn();
  const connectDB = dbError
    ? vi.fn().mockRejectedValue(dbError)
    : vi.fn().mockResolvedValue(undefined);
  const initializeChron = vi.fn();
  const apiRoutes = { mocked: true };

  vi.doMock("express", () => ({ default: expressMock }));
  vi.doMock("fs", () => ({ default: { existsSync }, existsSync }));
  vi.doMock("dotenv", () => ({ default: { config: dotenvConfig } }));
  vi.doMock("../models/db.js", () => ({ connectDB }));
  vi.doMock("../chron/index.js", () => ({ default: initializeChron }));
  vi.doMock("../routes/index.js", () => ({ default: apiRoutes }));

  const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => 0);

  await import("../index.js");
  await new Promise((resolve) => setTimeout(resolve, 0));

  return {
    app,
    expressMock,
    jsonMiddleware,
    staticMiddleware,
    existsSync,
    dotenvConfig,
    connectDB,
    initializeChron,
    apiRoutes,
    logSpy,
    errorSpy,
    exitSpy,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  delete process.env.PORT;
});

describe("server/index.js bootstrap", () => {
  it("configures middleware, routes, and monitoring endpoints", async () => {
    const ctx = await loadServer();

    expect(ctx.dotenvConfig).toHaveBeenCalledTimes(1);
    expect(ctx.expressMock).toHaveBeenCalledTimes(1);
    expect(ctx.app.use).toHaveBeenCalledWith(ctx.jsonMiddleware);
    expect(ctx.existsSync).toHaveBeenCalledTimes(1);
    expect(ctx.expressMock.static).toHaveBeenCalledTimes(2);
    expect(ctx.app.use).toHaveBeenCalledWith("/mock-websites", ctx.staticMiddleware);
    expect(ctx.app.use).toHaveBeenCalledWith(ctx.staticMiddleware);
    expect(ctx.app.use).toHaveBeenCalledWith("/api", ctx.apiRoutes);

    const rootHandler = ctx.app.get.mock.calls.find(
      (call) => call[0] instanceof RegExp,
    )?.[1];
    const healthHandler = ctx.app.get.mock.calls.find((call) => call[0] === "/health")?.[1];
    expect(typeof rootHandler).toBe("function");
    expect(typeof healthHandler).toBe("function");

    const rootRes = { sendFile: vi.fn() };
    rootHandler({}, rootRes);
    expect(rootRes.sendFile).toHaveBeenCalledTimes(1);

    const healthRes = { json: vi.fn() };
    healthHandler({}, healthRes);
    expect(healthRes.json).toHaveBeenCalledWith({ status: "ok" });
  });

  it("starts in the expected order and defaults to port 3000", async () => {
    const ctx = await loadServer();

    expect(ctx.initializeChron).toHaveBeenCalledTimes(1);
    expect(ctx.connectDB).toHaveBeenCalledTimes(1);
    expect(ctx.app.listen).toHaveBeenCalledWith(3000, expect.any(Function));

    expect(ctx.connectDB.mock.invocationCallOrder[0]).toBeLessThan(
      ctx.app.listen.mock.invocationCallOrder[0],
    );
    expect(ctx.logSpy).toHaveBeenCalledWith("Server running on port 3000");
    expect(ctx.exitSpy).not.toHaveBeenCalled();
  });

  it("uses PORT from environment when provided", async () => {
    const ctx = await loadServer({ port: 5050 });
    expect(ctx.app.listen).toHaveBeenCalledWith("5050", expect.any(Function));
    expect(ctx.logSpy).toHaveBeenCalledWith("Server running on port 5050");
  });

  it("uses API root response when frontend build is not present", async () => {
    const ctx = await loadServer({ hasClientBuild: false });

    const rootHandler = ctx.app.get.mock.calls.find((call) => call[0] === "/")?.[1];
    expect(typeof rootHandler).toBe("function");

    const rootRes = { json: vi.fn() };
    rootHandler({}, rootRes);

    expect(rootRes.json).toHaveBeenCalledWith({
      name: "Rental Finder API",
      health: "/health",
    });
  });

  it("logs startup failures and exits with code 1", async () => {
    const err = new Error("Database unavailable");
    const ctx = await loadServer({ dbError: err });

    expect(ctx.connectDB).toHaveBeenCalledTimes(1);
    expect(ctx.app.listen).not.toHaveBeenCalled();
    expect(ctx.errorSpy).toHaveBeenCalledWith("Failed to start server:", err);
    expect(ctx.exitSpy).toHaveBeenCalledWith(1);
  });
});