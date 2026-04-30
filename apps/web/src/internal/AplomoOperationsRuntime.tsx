import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import {
  advanceAplomoGovernedIndustrialDemo,
  createAplomoGovernedIndustrialDemoStore,
  type AplomoGovernedTelemetryOutput,
} from "@iyi/sync-core";

type AplomoOperationsRuntimeBundle = ReturnType<
  typeof createAplomoGovernedIndustrialDemoStore
>;

type AplomoOperationsSnapshot =
  AplomoOperationsRuntimeBundle["initialState"]["snapshot"];

type AplomoOperationsRuntimeContextValue = {
  runtime: AplomoOperationsRuntimeBundle;
  tick: number;
  snapshot: AplomoOperationsSnapshot;
  governedEvents: AplomoGovernedTelemetryOutput[];
  advanceTicks: (count: number) => void;
  resetDemo: () => void;
};

const AplomoOperationsRuntimeContext =
  createContext<AplomoOperationsRuntimeContextValue | null>(null);

export function AplomoOperationsRuntimeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [runtime, setRuntime] = useState(() =>
    createAplomoGovernedIndustrialDemoStore(),
  );
  const [tick, setTick] = useState(0);
  const [snapshot, setSnapshot] = useState(runtime.initialState.snapshot);
  const [governedEvents, setGovernedEvents] = useState<
    AplomoGovernedTelemetryOutput[]
  >(runtime.initialState.governedEvents);

  const advanceTicks = (count: number) => {
    const safeCount = Math.max(1, Math.min(Math.floor(count), 250));

    let nextTick = tick;
    let latestSnapshot = snapshot;
    const generatedEvents: AplomoGovernedTelemetryOutput[] = [];

    for (let index = 0; index < safeCount; index += 1) {
      nextTick += 1;
      const result = advanceAplomoGovernedIndustrialDemo(runtime.store, nextTick);
      latestSnapshot = result.snapshot;
      generatedEvents.push(...result.governedEvents);
    }

    setTick(nextTick);
    setSnapshot(latestSnapshot);
    setGovernedEvents((current) => [...generatedEvents, ...current].slice(0, 500));
  };

  const resetDemo = () => {
    const nextRuntime = createAplomoGovernedIndustrialDemoStore();

    setRuntime(nextRuntime);
    setTick(0);
    setSnapshot(nextRuntime.initialState.snapshot);
    setGovernedEvents(nextRuntime.initialState.governedEvents);
  };

  return (
    <AplomoOperationsRuntimeContext.Provider
      value={{
        runtime,
        tick,
        snapshot,
        governedEvents,
        advanceTicks,
        resetDemo,
      }}
    >
      {children}
    </AplomoOperationsRuntimeContext.Provider>
  );
}

export const useAplomoOperationsRuntime = () => {
  const context = useContext(AplomoOperationsRuntimeContext);

  if (!context) {
    throw new Error(
      "useAplomoOperationsRuntime must be used inside AplomoOperationsRuntimeProvider.",
    );
  }

  return context;
};
