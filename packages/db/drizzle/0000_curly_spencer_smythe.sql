CREATE SCHEMA "analytics";
--> statement-breakpoint
CREATE SCHEMA "audit";
--> statement-breakpoint
CREATE SCHEMA "core";
--> statement-breakpoint
CREATE SCHEMA "media";
--> statement-breakpoint
CREATE SCHEMA "operations";
--> statement-breakpoint
CREATE SCHEMA "spatial";
--> statement-breakpoint
CREATE SCHEMA "sync";
--> statement-breakpoint
CREATE TABLE "audit"."audit_log" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"terminal_id" uuid,
	"action_type" text NOT NULL,
	"affected_entity_id" text NOT NULL,
	"affected_entity_type" text NOT NULL,
	"previous_value" jsonb,
	"new_value" jsonb NOT NULL,
	"result" text NOT NULL,
	"sync_event_id" text,
	"integrity_hash_value" text,
	"created_by_user_id" uuid NOT NULL,
	"created_by_device_id" uuid NOT NULL,
	"source_runtime" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."devices" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"terminal_id" uuid,
	"name" text NOT NULL,
	"device_type" text NOT NULL,
	"active" boolean NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "operations"."equipment" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"terminal_id" uuid,
	"name" text NOT NULL,
	"equipment_type" text NOT NULL,
	"status" text NOT NULL,
	"geometry" jsonb,
	"created_by_user_id" uuid NOT NULL,
	"created_by_device_id" uuid NOT NULL,
	"source_runtime" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "media"."evidence_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"terminal_id" uuid,
	"evidence_id" text NOT NULL,
	"evidence_type" text NOT NULL,
	"storage_provider" text NOT NULL,
	"storage_key" text NOT NULL,
	"file_name" text,
	"mime_type" text,
	"byte_size" integer,
	"integrity_hash_algorithm" text,
	"integrity_hash_value" text,
	"related_entity_id" text,
	"related_event_id" text,
	"related_measurement_session_id" text,
	"created_by_user_id" uuid NOT NULL,
	"created_by_device_id" uuid NOT NULL,
	"source_runtime" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operations"."infrastructure" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"terminal_id" uuid,
	"name" text NOT NULL,
	"infrastructure_type" text NOT NULL,
	"geometry" jsonb NOT NULL,
	"validation_state" text NOT NULL,
	"confidence_level" text NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_by_device_id" uuid NOT NULL,
	"source_runtime" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "analytics"."kpi_snapshots" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"terminal_id" uuid,
	"kpi_key" text NOT NULL,
	"value" text NOT NULL,
	"classification" text NOT NULL,
	"snapshot_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operations"."materials" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"default_unit" text NOT NULL,
	"technical_properties" jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "spatial"."measurement_sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"terminal_id" uuid,
	"source_type" text NOT NULL,
	"operator_user_id" uuid NOT NULL,
	"device_label" text,
	"raw_evidence_id" text,
	"geometry" jsonb NOT NULL,
	"confidence_level" text NOT NULL,
	"validation_state" text NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_by_device_id" uuid NOT NULL,
	"source_runtime" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "operations"."operational_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"terminal_id" uuid,
	"event_type" text NOT NULL,
	"aggregate_type" text NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"payload" jsonb NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_by_device_id" uuid NOT NULL,
	"source_runtime" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics"."recommendations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"terminal_id" uuid,
	"title" text NOT NULL,
	"reason" text NOT NULL,
	"severity" text NOT NULL,
	"score" integer NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "analytics"."scenarios" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"terminal_id" uuid,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"input_snapshot" jsonb NOT NULL,
	"output_snapshot" jsonb NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_by_device_id" uuid NOT NULL,
	"source_runtime" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "operations"."stockpiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"terminal_id" uuid,
	"material_id" uuid NOT NULL,
	"name" text NOT NULL,
	"estimated_quantity" integer,
	"unit" text NOT NULL,
	"geometry" jsonb NOT NULL,
	"validation_state" text NOT NULL,
	"confidence_level" text NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_by_device_id" uuid NOT NULL,
	"source_runtime" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sync"."sync_batches" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"terminal_id" uuid,
	"batch_id" text NOT NULL,
	"device_id" uuid NOT NULL,
	"received_at_edge" timestamp with time zone NOT NULL,
	"result_summary" jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync"."sync_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"terminal_id" uuid,
	"event_id" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"local_sequence" integer NOT NULL,
	"aggregate_type" text NOT NULL,
	"aggregate_id" text NOT NULL,
	"event_type" text NOT NULL,
	"event_version" integer NOT NULL,
	"sync_status" text NOT NULL,
	"conflict_type" text,
	"payload" jsonb NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_by_device_id" uuid NOT NULL,
	"source_runtime" text NOT NULL,
	"created_at_client" timestamp with time zone NOT NULL,
	"received_at_edge" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."tenants" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "core"."terminals" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"location_label" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "core"."users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"email" text,
	"role" text NOT NULL,
	"active" boolean NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "spatial"."yards" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"terminal_id" uuid,
	"name" text NOT NULL,
	"geometry" jsonb NOT NULL,
	"validation_state" text NOT NULL,
	"confidence_level" text NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_by_device_id" uuid NOT NULL,
	"source_runtime" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "spatial"."zones" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"terminal_id" uuid,
	"yard_id" uuid NOT NULL,
	"name" text NOT NULL,
	"geometry" jsonb NOT NULL,
	"validation_state" text NOT NULL,
	"confidence_level" text NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_by_device_id" uuid NOT NULL,
	"source_runtime" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
