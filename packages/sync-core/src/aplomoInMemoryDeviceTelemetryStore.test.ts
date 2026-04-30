import { describe, expect, it } from "vitest";

import { createAplomoInMemoryDeviceTelemetryStore } from "./aplomoInMemoryDeviceTelemetryStore.js";

describe("AplomoInMemoryDeviceTelemetryStore", () => {
  it("registers a device, opens a session, opens a connection and stores GPS telemetry", () => {
    const store = createAplomoInMemoryDeviceTelemetryStore();

    const deviceResult = store.registerDevice({
      companyId: "company_1",
      siteId: "site_1",
      name: "Operador demo",
      type: "phone",
      capabilities: ["gps", "camera", "realtime_streaming"],
    });

    expect(deviceResult.ok).toBe(true);

    if (!deviceResult.ok) {
      throw new Error("Device registration failed");
    }

    const device = deviceResult.data.device;

    const sessionResult = store.startSession({
      companyId: "company_1",
      deviceId: device.id,
      profileId: "profile_1",
      ipAddress: "127.0.0.1",
      platform: "web",
    });

    expect(sessionResult.ok).toBe(true);

    if (!sessionResult.ok) {
      throw new Error("Session start failed");
    }

    const session = sessionResult.data.session;

    const connectionResult = store.openConnection({
      companyId: "company_1",
      deviceId: device.id,
      sessionId: session.id,
      connectionType: "browser",
      role: "emitter",
      protocol: "https",
    });

    expect(connectionResult.ok).toBe(true);

    const telemetryResult = store.submitGpsTelemetry({
      companyId: "company_1",
      deviceId: device.id,
      sessionId: session.id,
      source: "browser_geolocation",
      position: {
        latitude: 22.407,
        longitude: -97.9385,
      },
      quality: {
        fixType: "gps",
        accuracyMeters: 8.5,
      },
    });

    expect(telemetryResult.ok).toBe(true);

    const latestResult = store.listLatestDevicePositions({
      companyId: "company_1",
    });

    expect(latestResult.ok).toBe(true);

    if (!latestResult.ok) {
      throw new Error("Latest positions failed");
    }

    expect(latestResult.data.items).toHaveLength(1);
    expect(latestResult.data.items[0]?.deviceId).toBe(device.id);
  });
});
