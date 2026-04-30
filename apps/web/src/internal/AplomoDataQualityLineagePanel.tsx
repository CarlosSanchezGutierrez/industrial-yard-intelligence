import { useEffect, useMemo, useState } from "react";
import {
  calculateAplomoDataQualityLineageMetrics,
  emptyAplomoDataQualityLineageSnapshot,
  type AplomoDataQualityLineageSnapshot
} from "@iyi/domain";
import {
  createDemoAplomoDataQualityRun,
  exportAplomoDataQualityLineageCsv,
  exportAplomoDataQualityLineageJson,
  listAplomoDataQualityLineage
} from "../integrations/aplomoDataQualityLineageRepository.js";

type TabKey = "assets" | "rules" | "runs" | "lineage";

function downloadTextFile(fileName: string, mimeType: string, content: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
}

function MetricCard(props: { label: string; value: string | number; detail: string }) {
  return (
    <div style={{ border: "1px solid #d0d5dd", borderRadius: 12, padding: 14, background: "#ffffff" }}>
      <div style={{ fontSize: 12, color: "#667085", marginBottom: 6 }}>{props.label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: "#101828" }}>{props.value}</div>
      <div style={{ fontSize: 12, color: "#667085", marginTop: 6 }}>{props.detail}</div>
    </div>
  );
}

function ActionButton(props: { children: string; onClick: () => void; disabled?: boolean; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      style={{
        border: "1px solid #111827",
        borderRadius: 10,
        padding: "9px 12px",
        background: props.primary ? "#111827" : "#ffffff",
        color: props.primary ? "#ffffff" : "#111827",
        cursor: props.disabled ? "not-allowed" : "pointer",
        fontWeight: 700
      }}
    >
      {props.children}
    </button>
  );
}

export function AplomoDataQualityLineagePanel() {
  const [snapshot, setSnapshot] = useState<AplomoDataQualityLineageSnapshot>(emptyAplomoDataQualityLineageSnapshot);
  const [activeTab, setActiveTab] = useState<TabKey>("assets");
  const [status, setStatus] = useState("Ready.");
  const [isLoading, setIsLoading] = useState(false);

  const metrics = useMemo(() => calculateAplomoDataQualityLineageMetrics(snapshot), [snapshot]);

  async function reload(): Promise<void> {
    setIsLoading(true);
    setStatus("Loading Data Quality + Lineage Core...");

    try {
      const result = await listAplomoDataQualityLineage();
      setSnapshot(result.snapshot);
      setStatus("Data Quality + Lineage Core loaded.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unknown reload error.");
    } finally {
      setIsLoading(false);
    }
  }

  async function createDemoRun(): Promise<void> {
    setIsLoading(true);
    setStatus("Creating demo quality run...");

    try {
      const result = await createDemoAplomoDataQualityRun();
      setStatus(`Demo quality run created: ${result.run.runKey}.`);
      setActiveTab("runs");
      await reload();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unknown demo run error.");
    } finally {
      setIsLoading(false);
    }
  }

  function exportJson(): void {
    const exported = exportAplomoDataQualityLineageJson(snapshot);
    downloadTextFile(exported.fileName, exported.mimeType, exported.content);
  }

  function exportCsv(): void {
    const exported = exportAplomoDataQualityLineageCsv(snapshot);
    downloadTextFile(exported.fileName, exported.mimeType, exported.content);
  }

  useEffect(() => {
    void reload();
  }, []);

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "assets", label: "Assets" },
    { key: "rules", label: "Rules" },
    { key: "runs", label: "Quality runs" },
    { key: "lineage", label: "Lineage edges" }
  ];

  return (
    <section style={{ border: "1px solid #eaecf0", borderRadius: 18, padding: 20, background: "#f8fafc", marginTop: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#475467", textTransform: "uppercase", letterSpacing: 0.8 }}>
            Backend / Data Governance
          </div>
          <h2 style={{ margin: "6px 0", fontSize: 24, color: "#101828" }}>Data Quality + Lineage Core</h2>
          <p style={{ margin: 0, color: "#475467", maxWidth: 900 }}>
            Registry for data assets, data quality rules, quality execution evidence and lineage edges.
            This prepares the platform for BI, warehouse exports, cloud connectors and governed AI.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <ActionButton onClick={() => void reload()} disabled={isLoading} primary>Reload</ActionButton>
          <ActionButton onClick={() => void createDemoRun()} disabled={isLoading}>Create demo quality run</ActionButton>
          <ActionButton onClick={exportJson} disabled={isLoading}>Export JSON</ActionButton>
          <ActionButton onClick={exportCsv} disabled={isLoading}>Export CSV</ActionButton>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 18 }}>
        <MetricCard label="Assets" value={metrics.assetCount} detail="Registered data surfaces" />
        <MetricCard label="Active rules" value={metrics.activeRuleCount} detail="Quality expectations" />
        <MetricCard label="Failed runs" value={metrics.failedRunCount} detail="Failed or error evidence" />
        <MetricCard label="Avg score" value={metrics.averageQualityScore} detail="Across recorded runs" />
        <MetricCard label="Lineage edges" value={metrics.lineageEdgeCount} detail="Active dependency map" />
        <MetricCard label="AI / BI ready" value={`${metrics.aiReadyAssetCount} / ${metrics.biReadyAssetCount}`} detail="Governed readiness" />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              border: "1px solid #d0d5dd",
              borderRadius: 999,
              padding: "8px 12px",
              background: activeTab === tab.key ? "#111827" : "#ffffff",
              color: activeTab === tab.key ? "#ffffff" : "#344054",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid #d0d5dd", borderRadius: 14, background: "#ffffff", overflow: "auto" }}>
        {activeTab === "assets" && (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 920 }}>
            <thead>
              <tr>
                {["Asset", "Table", "Domain", "Tier", "AI", "BI", "Sensitivity"].map((header) => (
                  <th key={header} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eaecf0", fontSize: 12 }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {snapshot.assets.map((asset) => (
                <tr key={asset.assetKey}>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7", fontWeight: 700 }}>{asset.assetKey}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7" }}>{asset.tableName}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7" }}>{asset.domainArea}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7" }}>{asset.qualityTier}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7" }}>{asset.isAiReady ? "yes" : "no"}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7" }}>{asset.isBiReady ? "yes" : "no"}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7" }}>{asset.sensitivity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "rules" && (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 920 }}>
            <thead>
              <tr>
                {["Rule", "Asset", "Type", "Dimension", "Severity", "Expectation"].map((header) => (
                  <th key={header} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eaecf0", fontSize: 12 }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {snapshot.rules.map((rule) => (
                <tr key={rule.ruleKey}>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7", fontWeight: 700 }}>{rule.ruleKey}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7" }}>{rule.assetKey}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7" }}>{rule.ruleType}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7" }}>{rule.dimension}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7" }}>{rule.severity}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7" }}>{rule.expectation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "runs" && (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 920 }}>
            <thead>
              <tr>
                {["Run", "Rule", "Asset", "Status", "Score", "Message"].map((header) => (
                  <th key={header} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eaecf0", fontSize: 12 }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {snapshot.qualityRuns.map((run) => (
                <tr key={run.runKey}>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7", fontWeight: 700 }}>{run.runKey}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7" }}>{run.ruleKey}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7" }}>{run.assetKey}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7" }}>{run.status}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7" }}>{run.score}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7" }}>{run.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "lineage" && (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 920 }}>
            <thead>
              <tr>
                {["Edge", "Source", "Target", "Type", "Transform", "Confidence"].map((header) => (
                  <th key={header} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eaecf0", fontSize: 12 }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {snapshot.lineageEdges.map((edge) => (
                <tr key={edge.edgeKey}>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7", fontWeight: 700 }}>{edge.edgeKey}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7" }}>{edge.sourceAssetKey}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7" }}>{edge.targetAssetKey}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7" }}>{edge.lineageType}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7" }}>{edge.transformationKind}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f4f7" }}>{edge.confidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <footer style={{ marginTop: 12, color: "#475467", fontSize: 13 }}>
        {status}
      </footer>
    </section>
  );
}