import type {
    CloudApiStockpileLifecyclePayloadContract,
    CloudApiStockpileLifecycleStatusContract,
} from "@iyi/api-contracts";
import {
    getAllowedStockpileStatusTransitions,
    stockpileLifecycleStatuses,
} from "@iyi/domain";

export function createStockpileLifecyclePayload(): CloudApiStockpileLifecyclePayloadContract {
    const statuses = stockpileLifecycleStatuses.map(
        (status) => status as CloudApiStockpileLifecycleStatusContract,
    );

    const allowedTransitionsByStatus = Object.fromEntries(
        stockpileLifecycleStatuses.map((status) => [
            status,
            getAllowedStockpileStatusTransitions(status).map(
                (targetStatus) => targetStatus as CloudApiStockpileLifecycleStatusContract,
            ),
        ]),
    ) as Record<
        CloudApiStockpileLifecycleStatusContract,
        readonly CloudApiStockpileLifecycleStatusContract[]
    >;

    const transitions = statuses.flatMap((from) =>
        allowedTransitionsByStatus[from]
            .filter((to) => to !== from)
            .map((to) => ({
                from,
                to,
            })),
    );

    return {
        statuses,
        transitions,
        allowedTransitionsByStatus,
    };
}