// Minimal Admin GraphQL client for local setup scripts. Never imported by the storefront.
// Credentials come from .env.local (loaded by `node --env-file-if-exists`):
//   SHOPIFY_STORE_DOMAIN (or NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN)
//   SHOPIFY_ADMIN_API_ACCESS_TOKEN, or SHOPIFY_ADMIN_CLIENT_ID + SHOPIFY_ADMIN_CLIENT_SECRET
//   (Dev Dashboard app installed on the store; exchanged through the client credentials grant).

export const ADMIN_API_VERSION = process.env.SHOPIFY_ADMIN_API_VERSION || "2026-10";

const PLACEHOLDER = "__REPLACE_ME__";

function read(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value && !value.includes(PLACEHOLDER) ? value : undefined;
}

export interface AdminCredentials {
  domain: string;
  token: string;
}

export function readStoreDomain(): string | undefined {
  return read("SHOPIFY_STORE_DOMAIN") ?? read("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN");
}

export function hasAdminCredentials(): boolean {
  return (
    !!readStoreDomain() &&
    (!!read("SHOPIFY_ADMIN_API_ACCESS_TOKEN") ||
      (!!read("SHOPIFY_ADMIN_CLIENT_ID") && !!read("SHOPIFY_ADMIN_CLIENT_SECRET")))
  );
}

// shopify.dev: authentication-authorization/client-credentials-grant (tokens last 24 hours).
async function exchangeClientCredentials(domain: string): Promise<string> {
  const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
    body: new URLSearchParams({
      client_id: read("SHOPIFY_ADMIN_CLIENT_ID") ?? "",
      client_secret: read("SHOPIFY_ADMIN_CLIENT_SECRET") ?? "",
      grant_type: "client_credentials",
    }),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(
      `Shopify refused the client credentials (${response.status}). Check SHOPIFY_ADMIN_CLIENT_ID/SECRET and that the app is installed on ${domain} and owned by the same organization.`,
    );
  }
  const body = (await response.json()) as { access_token?: string };
  if (!body.access_token) throw new Error("Shopify returned no access_token.");
  return body.access_token;
}

export async function getAdminCredentials(): Promise<AdminCredentials> {
  const domain = readStoreDomain();
  if (!domain)
    throw new Error("Set SHOPIFY_STORE_DOMAIN (your-store.myshopify.com) in .env.local.");
  const token = read("SHOPIFY_ADMIN_API_ACCESS_TOKEN") ?? (await exchangeClientCredentials(domain));
  return { domain, token };
}

export interface UserError {
  code?: string | null;
  field?: string[] | null;
  message: string;
}

export async function adminRequest<T>(
  credentials: AdminCredentials,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const response = await fetch(
    `https://${credentials.domain}/admin/api/${ADMIN_API_VERSION}/graphql.json`,
    {
      body: JSON.stringify({ query, variables }),
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": credentials.token,
      },
      method: "POST",
    },
  );
  if (response.status === 401 || response.status === 403) {
    throw new Error(
      `Shopify rejected the Admin API token (${response.status}). It needs these scopes: read_products, write_products, read_metaobject_definitions, write_metaobject_definitions, read_metaobjects, write_metaobjects.`,
    );
  }
  if (!response.ok) throw new Error(`Admin API request failed with ${response.status}.`);
  const body = (await response.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (body.errors?.length) {
    throw new Error(`Admin API error: ${body.errors.map(({ message }) => message).join("; ")}`);
  }
  if (!body.data) throw new Error("Admin API returned no data.");
  return body.data;
}

export function assertNoUserErrors(label: string, errors: UserError[] | undefined) {
  if (errors && errors.length > 0) {
    throw new Error(`${label}: ${errors.map(({ message }) => message).join("; ")}`);
  }
}
