// Pure planning for `pnpm shopify:setup`: compares shopify/schema.ts with what the store already has.
// The plan only creates or updates. It never deletes, and it reports type changes it cannot make.
import type {
  FieldValidation,
  MetaobjectDefinition,
  MetaobjectFieldDefinition,
  ProductMetafieldDefinition,
} from "./schema.ts";

export interface ExistingValidation {
  name: string;
  value: string | null;
}

export interface ExistingMetafieldDefinition {
  description: string | null;
  key: string;
  name: string;
  namespace: string;
  storefrontAccess: string;
  type: string;
  validations: ExistingValidation[];
}

export interface ExistingMetaobjectField {
  description: string | null;
  key: string;
  name: string;
  required: boolean;
  type: string;
  validations: ExistingValidation[];
}

export interface ExistingMetaobjectDefinition {
  fields: ExistingMetaobjectField[];
  id: string;
  name: string;
  publishable: boolean;
  storefrontAccess: string;
  type: string;
}

export interface ExistingWebhook {
  filter: string | null;
  topic: string;
  uri: string;
}

export interface ExistingState {
  metafieldDefinitions: ExistingMetafieldDefinition[];
  metaobjectDefinitions: ExistingMetaobjectDefinition[];
  webhooks: ExistingWebhook[];
}

export interface WebhookSpec {
  filter?: string;
  topic: string;
}

export type PlanAction =
  | { definition: MetaobjectDefinition; kind: "create-metaobject" }
  | {
      changes: string[];
      createFields: MetaobjectFieldDefinition[];
      definition: MetaobjectDefinition;
      id: string;
      kind: "update-metaobject";
      updateFields: MetaobjectFieldDefinition[];
    }
  | { definition: ProductMetafieldDefinition; kind: "create-metafield" }
  | { changes: string[]; definition: ProductMetafieldDefinition; kind: "update-metafield" }
  | { filter?: string; kind: "create-webhook"; topic: string; uri: string };

export interface Plan {
  actions: PlanAction[];
  unchanged: string[];
  warnings: string[];
}

export const STOREFRONT_READ = "PUBLIC_READ";

function sameValidations(
  wanted: readonly FieldValidation[] | undefined,
  existing: readonly ExistingValidation[],
): boolean {
  const normalize = (list: ReadonlyArray<{ name: string; value: string | null }>) =>
    JSON.stringify([...list].map(({ name, value }) => [name, value ?? ""]).sort());
  return normalize(wanted ?? []) === normalize(existing);
}

function fieldChanges(
  wanted: MetaobjectFieldDefinition,
  existing: ExistingMetaobjectField,
): string[] {
  const changes: string[] = [];
  if (wanted.name !== existing.name) changes.push("name");
  if ((wanted.description ?? null) !== (existing.description || null)) changes.push("description");
  if ((wanted.required ?? false) !== existing.required) changes.push("required");
  if (!sameValidations(wanted.validations, existing.validations)) changes.push("validations");
  return changes;
}

// Definitions referenced through `metaobject_definition_type` validations must exist first.
export function orderMetaobjectDefinitions<T extends MetaobjectDefinition>(
  definitions: readonly T[],
): T[] {
  const dependsOn = (definition: T) =>
    definition.fields.flatMap((field) =>
      (field.validations ?? [])
        .filter((validation) => validation.name === "metaobject_definition_type")
        .map((validation) => validation.value),
    );
  const ordered: T[] = [];
  const visit = (definition: T, trail: Set<string>) => {
    if (ordered.includes(definition) || trail.has(definition.type)) return;
    trail.add(definition.type);
    for (const type of dependsOn(definition)) {
      const dependency = definitions.find((candidate) => candidate.type === type);
      if (dependency) visit(dependency, trail);
    }
    ordered.push(definition);
  };
  for (const definition of definitions) visit(definition, new Set());
  return ordered;
}

export function planSetup({
  existing,
  metafieldDefinitions,
  metafieldNamespace,
  metaobjectDefinitions,
  webhooks,
  webhookUri,
}: {
  existing: ExistingState;
  metafieldDefinitions: readonly ProductMetafieldDefinition[];
  metafieldNamespace: string;
  metaobjectDefinitions: readonly MetaobjectDefinition[];
  webhooks: readonly WebhookSpec[];
  webhookUri: string | null;
}): Plan {
  const plan: Plan = { actions: [], unchanged: [], warnings: [] };

  for (const definition of orderMetaobjectDefinitions(metaobjectDefinitions)) {
    const current = existing.metaobjectDefinitions.find(({ type }) => type === definition.type);
    const label = `metaobject ${definition.type}`;
    if (!current) {
      plan.actions.push({ definition, kind: "create-metaobject" });
      continue;
    }
    const changes: string[] = [];
    if (current.name !== definition.name) changes.push("name");
    if (current.storefrontAccess !== STOREFRONT_READ) changes.push("storefront access");
    if (definition.publishable && !current.publishable) changes.push("publishable");
    const createFields: MetaobjectFieldDefinition[] = [];
    const updateFields: MetaobjectFieldDefinition[] = [];
    for (const field of definition.fields) {
      const currentField = current.fields.find(({ key }) => key === field.key);
      if (!currentField) {
        createFields.push(field);
        changes.push(`add field ${field.key}`);
      } else if (currentField.type !== field.type) {
        plan.warnings.push(
          `${label}: field "${field.key}" is ${currentField.type} in Shopify but ${field.type} in shopify/schema.ts. Types cannot change; use a new key or change it by hand.`,
        );
      } else {
        const fieldDiff = fieldChanges(field, currentField);
        if (fieldDiff.length > 0) {
          updateFields.push(field);
          changes.push(`update field ${field.key} (${fieldDiff.join(", ")})`);
        }
      }
    }
    for (const field of current.fields) {
      if (!definition.fields.some(({ key }) => key === field.key)) {
        plan.warnings.push(`${label}: field "${field.key}" exists only in Shopify; left as is.`);
      }
    }
    if (changes.length === 0) {
      plan.unchanged.push(label);
    } else {
      plan.actions.push({
        changes,
        createFields,
        definition,
        id: current.id,
        kind: "update-metaobject",
        updateFields,
      });
    }
  }

  for (const definition of metafieldDefinitions) {
    const label = `product metafield ${metafieldNamespace}.${definition.key}`;
    const current = existing.metafieldDefinitions.find(
      ({ key, namespace }) => namespace === metafieldNamespace && key === definition.key,
    );
    if (!current) {
      plan.actions.push({ definition, kind: "create-metafield" });
      continue;
    }
    if (current.type !== definition.type) {
      plan.warnings.push(
        `${label} is ${current.type} in Shopify but ${definition.type} in shopify/schema.ts. Types cannot change; use a new key or change it by hand.`,
      );
      continue;
    }
    const changes: string[] = [];
    if (current.name !== definition.name) changes.push("name");
    if ((current.description || null) !== definition.description) changes.push("description");
    if (current.storefrontAccess !== STOREFRONT_READ) changes.push("storefront access");
    if (!sameValidations(definition.validations, current.validations)) changes.push("validations");
    if (changes.length === 0) plan.unchanged.push(label);
    else plan.actions.push({ changes, definition, kind: "update-metafield" });
  }

  if (!webhookUri) {
    plan.warnings.push(
      "Webhooks skipped: set NEXT_PUBLIC_SITE_URL to the public https:// address of the store (not localhost), then run setup again.",
    );
  } else {
    for (const webhook of webhooks) {
      const label = `webhook ${webhook.topic}`;
      const matches = existing.webhooks.filter(({ topic }) => topic === webhook.topic);
      const exact = matches.find(
        ({ filter, uri }) => uri === webhookUri && (filter || undefined) === webhook.filter,
      );
      if (exact) {
        plan.unchanged.push(label);
        continue;
      }
      for (const other of matches) {
        plan.warnings.push(`${label}: another subscription points at ${other.uri}; left as is.`);
      }
      plan.actions.push({
        filter: webhook.filter,
        kind: "create-webhook",
        topic: webhook.topic,
        uri: webhookUri,
      });
    }
  }

  return plan;
}

// Webhooks need a public https URL that Shopify can reach.
export function resolveWebhookUri(siteUrl: string | undefined): string | null {
  if (!siteUrl || siteUrl.includes("__REPLACE_ME__")) return null;
  let url: URL;
  try {
    url = new URL(siteUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname)) return null;
  return new URL("/api/webhooks/shopify", url).toString();
}

export function describeAction(action: PlanAction): string {
  switch (action.kind) {
    case "create-metaobject":
      return `create metaobject definition "${action.definition.type}" (${action.definition.fields.length} fields)`;
    case "update-metaobject":
      return `update metaobject definition "${action.definition.type}": ${action.changes.join("; ")}`;
    case "create-metafield":
      return `create product metafield definition "${action.definition.key}" (${action.definition.type})`;
    case "update-metafield":
      return `update product metafield definition "${action.definition.key}": ${action.changes.join(", ")}`;
    case "create-webhook":
      return `register webhook ${action.topic}${action.filter ? ` [${action.filter}]` : ""} → ${action.uri}`;
  }
}
