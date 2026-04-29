import type {
    CloudApiStockpileLifecyclePayloadContract,
    CloudApiStockpileLifecycleStatusContract,
} from "@iyi/api-contracts";
import {
    getAllowedStockpileStatusTransitions,
    stockpileLifecycleStatuses,
} from "@iyi/domain";

function toContractStatus(status: string): CloudApiStockpileLifecycleStatusContract {
    return status as CloudApiStockpileLifecycleStatusContract;
}

export function createStockpileLifecyclePayload(): CloudApiStockpileLifecyclePayloadContract {
    const statuses = stockpileLifecycleStatuses.map(toContractStatus);

    const allowedTransitionsByStatus: Record<
        CloudApiStockpileLifecycleStatusContract,
        readonly CloudApiStockpileLifecycleStatusContract[]
    > = {
        draft: getAllowedStockpileStatusTransitions("draft").map(toContractStatus),
        operational: getAllowedStockpileStatusTransitions("operational").map(toContractStatus),
        pending_review: getAllowedStockpileStatusTransitions("pending_review").map(toContractStatus),
        validated: getAllowedStockpileStatusTransitions("validated").map(toContractStatus),
        archived: getAllowedStockpileStatusTransitions("archived").map(toContractStatus),
    };

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