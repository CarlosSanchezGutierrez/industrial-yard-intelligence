import { useMemo, useState, type FormEvent } from "react";
import type { CloudApiStockpileStatusContract } from "@iyi/api-contracts";
import {
  updateCloudApiStockpileStatus,
  type CloudApiDashboardSnapshot
} from "../data/api-client.js";

interface StockpileStatusPanelProps {
  readonly snapshot: CloudApiDashboardSnapshot | null;
  readonly onUpdated: () => void | Promise<void>;
}

const allowedStatuses: readonly CloudApiStockpileStatusContract[] = [
  "draft",
  "operational",
  "pending_review",
  "validated",
  "archived"
];

export function StockpileStatusPanel({ snapshot, onUpdated }: StockpileStatusPanelProps) {
  const [selectedStockpileId, setSelectedStockpileId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<CloudApiStockpileStatusContract>("validated");
  const [message, setMessage] = useState("Sin actualización enviada todavía.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stockpiles = snapshot?.stockpiles ?? [];

  const selectedStockpile = useMemo(
    () => stockpiles.find((stockpile) => stockpile.id === selectedStockpileId) ?? null,
    [selectedStockpileId, stockpiles]
  );

  const canSubmit = selectedStockpile !== null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (selectedStockpile === null) {
      setMessage("Selecciona un stockpile antes de actualizar estado.");
      return;
    }

    setIsSubmitting(true);

    const result = await updateCloudApiStockpileStatus(selectedStockpile.id, selectedStatus);

    setMessage(result.message);

    if (result.ok) {
      await onUpdated();
    }

    setIsSubmitting(false);
  }

  return (
    <section className="stockpile-status-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Supervisor Flow</p>
          <h2>Actualizar estado de stockpile</h2>
        </div>
        <span className="stockpile-status-badge">{snapshot === null ? "API REQUIRED" : "READY"}</span>
      </div>

      <p className="stockpile-status-message">{message}</p>

      {snapshot === null ? (
        <div className="empty-state">
          Carga Cloud API antes de actualizar estados.
        </div>
      ) : (
        <form className="stockpile-status-form" onSubmit={(event) => void handleSubmit(event)}>
          <label>
            <span>Stockpile</span>
            <select
              value={selectedStockpileId}
              onChange={(event) => setSelectedStockpileId(event.target.value)}
            >
              <option value="">Seleccionar stockpile</option>
              {stockpiles.map((stockpile) => (
                <option key={stockpile.id} value={stockpile.id}>
                  {stockpile.name} · {stockpile.status}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Nuevo estado</span>
            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value as CloudApiStockpileStatusContract)}
            >
              {allowedStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <button className="primary-button" disabled={!canSubmit || isSubmitting} type="submit">
            {isSubmitting ? "Actualizando estado..." : "Actualizar estado"}
          </button>
        </form>
      )}

      {selectedStockpile !== null ? (
        <div className="stockpile-status-preview">
          <strong>{selectedStockpile.name}</strong>
          <span>
            Actual: {selectedStockpile.status} · Material: {selectedStockpile.material} · Tons:{" "}
            {selectedStockpile.estimatedTons}
          </span>
        </div>
      ) : null}
    </section>
  );
}