import { getAplomoSupabaseMvpClient } from "./aplomoSupabaseMvpRepository.js";
import {
  loadAplomoPlatformAdminSnapshot,
  type AplomoPlatformAdminSnapshot,
  type AplomoPlatformCompanySummary,
} from "./aplomoSupabasePlatformAdminRepository.js";

export type AplomoCustomerHealthBand = "excellent" | "healthy" | "watch" | "risk";

export type AplomoComputedCustomerHealthScore = {
  companyId: string;
  companyName: string;
  companySlug: string;
  totalScore: number;
  band: AplomoCustomerHealthBand;
  adoptionScore: number;
  operationsScore: number;
  gpsQualityScore: number;
  dataReadinessScore: number;
  activityScore: number;
  riskFactors: string[];
  recommendedActions: string[];
  rawSummary: AplomoPlatformCompanySummary;
};

export type AplomoCustomerHealthSnapshotRow = {
  id: string;
  company_id: string;
  computed_by_profile_id: string;
  score_total: number;
  band: AplomoCustomerHealthBand;
  adoption_score: number;
  operations_score: number;
  gps_quality_score: number;
  data_readiness_score: number;
  activity_score: number;
  risk_factors: string[];
  recommended_actions: string[];
  raw_snapshot: Record<string, unknown>;
  computed_at: string;
  created_at: string;
};

export type AplomoPersistCustomerHealthSnapshotResult = {
  loadedAt: string;
  computedByProfileId: string;
  insertedRows: AplomoCustomerHealthSnapshotRow[];
};

const clampScore = (value: number): number => {
  return Math.max(0, Math.min(100, Math.round(value)));
};

const bandFromScore = (score: number): AplomoCustomerHealthBand => {
  if (score >= 85) {
    return "excellent";
  }

  if (score >= 70) {
    return "healthy";
  }

  if (score >= 50) {
    return "watch";
  }

  return "risk";
};

const daysSince = (dateValue: string | null): number | null => {
  if (!dateValue) {
    return null;
  }

  const time = new Date(dateValue).getTime();

  if (!Number.isFinite(time)) {
    return null;
  }

  const diffMs = Date.now() - time;

  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
};

export const computeAplomoCustomerHealthScore = (
  summary: AplomoPlatformCompanySummary,
): AplomoComputedCustomerHealthScore => {
  const riskFactors: string[] = [];
  const recommendedActions: string[] = [];

  const adoptionScore = clampScore(
    summary.activeUserCount > 0
      ? 35 +
          Math.min(summary.activeUserCount, 10) * 4 +
          Math.min(summary.adminCount, 2) * 12
      : 0,
  );

  if (summary.activeUserCount === 0) {
    riskFactors.push("No active users.");
    recommendedActions.push("Onboard at least one tenant owner and one operator.");
  }

  if (summary.adminCount === 0) {
    riskFactors.push("No tenant admin configured.");
    recommendedActions.push("Assign a tenant_owner or tenant_admin.");
  }

  const operationsScore = clampScore(
    summary.siteCount * 18 +
      summary.deviceCount * 12 +
      summary.stockpileCount * 10 +
      summary.livePositionCount * 12,
  );

  if (summary.siteCount === 0) {
    riskFactors.push("No sites configured.");
    recommendedActions.push("Create at least one site, plant or yard.");
  }

  if (summary.deviceCount === 0) {
    riskFactors.push("No devices configured.");
    recommendedActions.push("Register at least one GPS/mobile/gateway device.");
  }

  if (summary.livePositionCount === 0) {
    riskFactors.push("No live device positions.");
    recommendedActions.push("Capture GPS from browser or connect a device feed.");
  }

  const gpsQualityScore =
    summary.livePositionCount === 0
      ? 0
      : clampScore(
          35 +
            (summary.highPrecisionPositionCount / summary.livePositionCount) * 65,
        );

  if (summary.livePositionCount > 0 && summary.highPrecisionPositionCount === 0) {
    riskFactors.push("No high precision GPS positions.");
    recommendedActions.push("Review GPS accuracy, RTK/NTRIP readiness or device settings.");
  }

  const dataReadinessScore = clampScore(
    summary.stockpileCount * 16 +
      (summary.estimatedVolumeM3 > 0 ? 22 : 0) +
      (summary.estimatedWeightTons > 0 ? 22 : 0) +
      summary.livePositionCount * 8,
  );

  if (summary.stockpileCount === 0) {
    riskFactors.push("No stockpiles configured.");
    recommendedActions.push("Create stockpiles and assign material types.");
  }

  const inactiveDays = daysSince(summary.lastActivityAt);
  const activityScore =
    inactiveDays === null
      ? 0
      : clampScore(100 - Math.min(inactiveDays, 30) * 3.2);

  if (inactiveDays === null) {
    riskFactors.push("No recent activity.");
    recommendedActions.push("Run a demo capture or operational check-in.");
  } else if (inactiveDays >= 7) {
    riskFactors.push(`No activity in ${inactiveDays} days.`);
    recommendedActions.push("Contact customer owner and review adoption blockers.");
  }

  const totalScore = clampScore(
    adoptionScore * 0.24 +
      operationsScore * 0.24 +
      gpsQualityScore * 0.18 +
      dataReadinessScore * 0.18 +
      activityScore * 0.16,
  );

  if (recommendedActions.length === 0) {
    recommendedActions.push("Continue monitoring usage, GPS quality and expansion signals.");
  }

  return {
    companyId: summary.company.id,
    companyName: summary.company.name,
    companySlug: summary.company.slug,
    totalScore,
    band: bandFromScore(totalScore),
    adoptionScore,
    operationsScore,
    gpsQualityScore,
    dataReadinessScore,
    activityScore,
    riskFactors,
    recommendedActions,
    rawSummary: summary,
  };
};

const throwIfError = (
  error: { message: string } | null,
  context: string,
): void => {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
};

export const computeAplomoCustomerHealthScoresFromSnapshot = (
  snapshot: AplomoPlatformAdminSnapshot,
): AplomoComputedCustomerHealthScore[] => {
  return snapshot.companySummaries
    .map(computeAplomoCustomerHealthScore)
    .sort((a, b) => a.totalScore - b.totalScore);
};

export const persistAplomoCustomerHealthSnapshots =
  async (): Promise<AplomoPersistCustomerHealthSnapshotResult> => {
    const supabase = getAplomoSupabaseMvpClient();

    const userResult = await supabase.auth.getUser();
    throwIfError(userResult.error, "read current user");

    const user = userResult.data.user;

    if (!user) {
      throw new Error("Sign in before persisting customer health snapshots.");
    }

    const snapshot = await loadAplomoPlatformAdminSnapshot();
    const scores = computeAplomoCustomerHealthScoresFromSnapshot(snapshot);
    const computedAt = new Date().toISOString();

    const payload = scores.map((score) => ({
      company_id: score.companyId,
      computed_by_profile_id: user.id,
      score_total: score.totalScore,
      band: score.band,
      adoption_score: score.adoptionScore,
      operations_score: score.operationsScore,
      gps_quality_score: score.gpsQualityScore,
      data_readiness_score: score.dataReadinessScore,
      activity_score: score.activityScore,
      risk_factors: score.riskFactors,
      recommended_actions: score.recommendedActions,
      raw_snapshot: {
        companyName: score.companyName,
        companySlug: score.companySlug,
        summary: score.rawSummary,
      },
      computed_at: computedAt,
    }));

    if (payload.length === 0) {
      return {
        loadedAt: computedAt,
        computedByProfileId: user.id,
        insertedRows: [],
      };
    }

    const insertResult = await supabase
      .from("aplomo_customer_health_snapshots")
      .insert(payload)
      .select("*");

    throwIfError(insertResult.error, "insert customer health snapshots");

    return {
      loadedAt: computedAt,
      computedByProfileId: user.id,
      insertedRows: (insertResult.data ?? []) as AplomoCustomerHealthSnapshotRow[],
    };
  };

export const loadAplomoCustomerHealthSnapshotHistory =
  async (): Promise<AplomoCustomerHealthSnapshotRow[]> => {
    const supabase = getAplomoSupabaseMvpClient();

    const result = await supabase
      .from("aplomo_customer_health_snapshots")
      .select("*")
      .order("computed_at", { ascending: false })
      .limit(200);

    throwIfError(result.error, "read customer health snapshot history");

    return (result.data ?? []) as AplomoCustomerHealthSnapshotRow[];
  };
