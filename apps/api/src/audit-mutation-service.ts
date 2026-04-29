import { createHash } from "node:crypto";

import type {
    CloudApiAuditActorContract,
    CloudApiAuditMutationEntryContract,
    CloudApiAuditMutationPayloadContract,
} from "@iyi/api-contracts";

export interface CreateAuditMutationEntryInput {
    readonly requestId: string;
    readonly occurredAt: Date;
    readonly mutation: CloudApiAuditMutationPayloadContract;
    readonly actor?: CloudApiAuditActorContract;
}

function sanitizeIdSegment(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/gu, "_")
        .replace(/^_+|_+$/gu, "");
}

export function createAuditMutationEntry(
    input: CreateAuditMutationEntryInput,
): CloudApiAuditMutationEntryContract {
    const actor: CloudApiAuditActorContract =
        input.actor ??
        {
            type: "service",
            id: "cloud_api",
            displayName: "Cloud API",
        };

    const occurredAt = input.occurredAt.toISOString();
    const hash = createHash("sha256")
        .update(
            JSON.stringify({
                requestId: input.requestId,
                occurredAt,
                mutation: input.mutation,
                actor,
            }),
        )
        .digest("hex")
        .slice(0, 16);

    return {
        id: [
            "audit",
            sanitizeIdSegment(input.mutation.type),
            sanitizeIdSegment(input.requestId),
            hash,
        ].join("_"),
        context: {
            requestId: input.requestId,
            occurredAt,
            source: "cloud_api",
            actor,
        },
        mutation: input.mutation,
    };
}