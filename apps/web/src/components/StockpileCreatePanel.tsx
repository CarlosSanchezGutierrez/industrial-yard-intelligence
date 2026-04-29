import { useMemo, useState, type FormEvent } from "react";
import { createCloudApiStockpile, type CloudApiDashboardSnapshot } from "../data/api-client.js";

interface StockpileCreatePanelProps {
  readonly snapshot: CloudApiDashboardSnapshot | null;
  readonly onCreated: () => void | Promise<void>;
}

interface StockpileFormState {
  readonly name: string;
  readonly material: string;
  readonly estimatedTons: string;
  readonly status: "draft" | "operational" | "pending_review" | "validated" | "archived";
}

const initialFormState: StockpileFormState = {
  name: "",
  material: "pet coke",
  estimatedTons: "0",
  status: "draft"
};

function createStockpileId(name: string): string {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return `stockpile_web_${normalized}_${Date.now()}`;
}

export function StockpileCreatePanel({ snapshot, onCreated }: StockpileCreatePanelProps) {
  const [formState, setFormState] = useState<StockpileFormState>(initialFormState);
  const [message, setMessage] = useState("Sin creación enviada todavía.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tenant = snapshot?.tenants[0] ?? null;
  const canSubmit = tenant !== null && formState.name.trim().length > 0 && formState.material.trim().length > 0;

  const helperText = useMemo(() => {
    if (tenant === null) {
      return "Primero carga Cloud API para obtener el tenant activo.";
    }

    return `Se creará en tenant ${tenant.id} y terminal terminal_altamira.`;
  }, [tenant]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (tenant === null) {
      setMessage("Carga Cloud API antes de crear un stockpile.");
      return;
    }

    if (!canSubmit) {
      setMessage("Completa nombre y material.");
      return;
    }

    const estimatedTons = Number.parseFloat(formState.estimatedTons);

    setIsSubmitting(true);

    const result = await createCloudApiStockpile({
      id: createStockpileId(formState.name),
      tenantId: tenant.id,
      terminalId: "terminal_altamira",
      name: formState.name.trim(),
      material: formState.material.trim(),
      category: "bulk",
      estimatedTons: Number.isFinite(estimatedTons) ? estimatedTons : 0,
      status: formState.status,
      validationState: "created_from_web",
      confidenceLevel: "operator_input"
    });

    setMessage(result.message);

    if (result.ok) {
      setFormState(initialFormState);
      await onCreated();
    }

    setIsSubmitting(false);
  }

  return (
    <section className="stockpile-create-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Cloud API Write</p>
          <h2>Crear stockpile</h2>
        </div>
        <span className="stockpile-create-status">{snapshot === null ? "API REQUIRED" : "READY"}</span>
      </div>

      <p className="stockpile-create-message">{message}</p>
      <p className="stockpile-create-helper">{helperText}</p>

      <form className="stockpile-create-form" onSubmit={(event) => void handleSubmit(event)}>
        <label>
          <span>Nombre del patio/material</span>
          <input
            placeholder="Ej. Patio nuevo coque norte"
            value={formState.name}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                name: event.target.value
              }))
            }
          />
        </label>

        <label>
          <span>Material</span>
          <input
            placeholder="Ej. pet coke"
            value={formState.material}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                material: event.target.value
              }))
            }
          />
        </label>

        <label>
          <span>Toneladas estimadas</span>
          <input
            min="0"
            step="0.001"
            type="number"
            value={formState.estimatedTons}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                estimatedTons: event.target.value
              }))
            }
          />
        </label>

        <label>
          <span>Estado</span>
          <select
            value={formState.status}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                status: event.target.value as StockpileFormState["status"]
              }))
            }
          >
            <option value="draft">draft</option>
            <option value="operational">operational</option>
            <option value="pending_review">pending_review</option>
            <option value="validated">validated</option>
            <option value="archived">archived</option>
          </select>
        </label>

        <button className="primary-button" disabled={!canSubmit || isSubmitting} type="submit">
          {isSubmitting ? "Creando stockpile..." : "Crear stockpile en API"}
        </button>
      </form>
    </section>
  );
}