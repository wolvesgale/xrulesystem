// Lightweight Google APIs helper used when googleapis package is unavailable in the sandbox.
import crypto from "crypto";

type JWTOptions = {
  email: string;
  key: string;
  scopes: string[];
};

type AccessTokenInfo = {
  accessToken: string;
  expiry: number;
};

class JWT {
  private email: string;
  private key: string;
  private scopes: string[];
  private cachedToken: AccessTokenInfo | null;

  constructor(options: JWTOptions);
  constructor(email: string, key?: string, scopes?: string[]);
  constructor(optionsOrEmail: JWTOptions | string, key = "", scopes: string[] = []) {
    this.email = typeof optionsOrEmail === "string" ? optionsOrEmail : optionsOrEmail.email;
    this.key = typeof optionsOrEmail === "string" ? key : optionsOrEmail.key;
    this.scopes = typeof optionsOrEmail === "string" ? scopes : optionsOrEmail.scopes;
    this.cachedToken = null;
  }

  // Generates OAuth2 access token from a service account key.
  async getAccessToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    if (this.cachedToken && this.cachedToken.expiry > now + 60) {
      return this.cachedToken.accessToken;
    }

    const header = { alg: "RS256", typ: "JWT" };
    const payload = {
      iss: this.email,
      scope: this.scopes.join(" "),
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const unsigned = `${encodedHeader}.${encodedPayload}`;
    const signer = crypto.createSign("RSA-SHA256");
    signer.update(unsigned);
    const signature = signer.sign(this.key).toString("base64url");
    const assertion = `${unsigned}.${signature}`;

    const body = new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    });

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Google access token: ${response.statusText}`);
    }

    const data = (await response.json()) as { access_token: string; expires_in: number };
    this.cachedToken = {
      accessToken: data.access_token,
      expiry: now + data.expires_in
    };
    return this.cachedToken.accessToken;
  }

  // Builds Authorization header for API requests.
  async getRequestHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken();
    return { Authorization: `Bearer ${token}` };
  }
}

class SheetsValuesResource {
  constructor(private auth: JWT, private spreadsheetId: string) {}

  // Calls the Sheets API values.get endpoint.
  async get(params: { range: string }): Promise<{ data: { values?: string[][] } }> {
    const headers = await this.auth.getRequestHeaders();
    const url = new URL(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${encodeURIComponent(
        params.range
      )}`
    );
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet values: ${response.statusText}`);
    }
    const data = (await response.json()) as { values?: string[][] };
    return { data };
  }

  // Calls the Sheets API values.append endpoint.
  async append(params: {
    range: string;
    valueInputOption: string;
    requestBody: { values: string[][] };
  }): Promise<void> {
    const headers = await this.auth.getRequestHeaders();
    headers["Content-Type"] = "application/json";
    const url = new URL(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${encodeURIComponent(
        params.range
      )}:append`
    );
    url.searchParams.set("valueInputOption", params.valueInputOption);
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(params.requestBody)
    });
    if (!response.ok) {
      throw new Error(`Failed to append sheet values: ${response.statusText}`);
    }
  }

  // Calls the Sheets API values.update endpoint.
  async update(params: {
    range: string;
    valueInputOption: string;
    requestBody: { values: string[][] };
  }): Promise<void> {
    const headers = await this.auth.getRequestHeaders();
    headers["Content-Type"] = "application/json";
    const url = new URL(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${encodeURIComponent(
        params.range
      )}`
    );
    url.searchParams.set("valueInputOption", params.valueInputOption);
    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(params.requestBody)
    });
    if (!response.ok) {
      throw new Error(`Failed to update sheet values: ${response.statusText}`);
    }
  }

  // Calls the Sheets API values.clear endpoint.
  async clear(params: { range: string }): Promise<void> {
    const headers = await this.auth.getRequestHeaders();
    headers["Content-Type"] = "application/json";
    const url = new URL(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${encodeURIComponent(
        params.range
      )}/clear`
    );
    const response = await fetch(url, { method: "POST", headers });
    if (!response.ok) {
      throw new Error(`Failed to clear sheet values: ${response.statusText}`);
    }
  }
}

class SheetsApi {
  public spreadsheets: { values: SheetsValuesResource };

  constructor(auth: JWT, spreadsheetId: string) {
    this.spreadsheets = { values: new SheetsValuesResource(auth, spreadsheetId) };
  }
}

function sheets({ auth, spreadsheetId }: { auth: JWT; spreadsheetId: string }) {
  return new SheetsApi(auth, spreadsheetId);
}

export const google = { auth: { JWT }, sheets };
