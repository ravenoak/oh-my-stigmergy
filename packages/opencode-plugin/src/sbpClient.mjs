/**
 * Minimal HTTP client for packages/sbp-server ledger API.
 * @param {{ baseUrl: string }} opts
 */
export function createSbpClient({ baseUrl }) {
  const base = String(baseUrl || "").replace(/\/$/, "");

  /**
   * @param {string} method
   * @param {string} path
   * @param {object | null} jsonBody
   */
  async function request(method, path, jsonBody) {
    const url = `${base}${path}`;
    const init = {
      method,
      headers: jsonBody ? { "Content-Type": "application/json" } : {},
      body: jsonBody !== null && jsonBody !== undefined ? JSON.stringify(jsonBody) : undefined,
    };
    const res = await fetch(url, init);
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  }

  return {
    base,

    /** @param {object} body pheromone POST body */
    async publish(body) {
      return request("POST", "/pheromones", body);
    },

    async listPheromones() {
      return request("GET", "/pheromones", null);
    },

    /** @param {string} id */
    async claim(id) {
      return request("POST", `/pheromones/${encodeURIComponent(id)}/claim`, "");
    },

    /** @param {string} id */
    async inflate(id) {
      return request("POST", `/pheromones/${encodeURIComponent(id)}/inflate`, "");
    },
  };
}
