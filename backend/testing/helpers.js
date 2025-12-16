import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";
import { BASE_URL, TEST_USER } from "./config.js";

// Custom metrics
export const errorRate = new Rate("errors");
export const readLatency = new Trend("read_latency", true);
export const writeLatency = new Trend("write_latency", true);
export const requestCount = new Counter("requests");

/**
 * Login dan dapatkan token autentikasi
 * @returns {string} Bearer token
 */
export function login() {
  const loginPayload = JSON.stringify({
    email: TEST_USER.email,
    password: TEST_USER.password,
  });

  const loginHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, loginPayload, {
    headers: loginHeaders,
  });

  const success = check(loginRes, {
    "login successful": (r) => r.status === 200,
    "has token": (r) => {
      try {
        const body = JSON.parse(r.body);
        // API bisa return {data: {token}} atau {token} langsung
        return (body.data && body.data.token) || body.token;
      } catch {
        return false;
      }
    },
  });

  if (!success) {
    console.error(`Login failed: ${loginRes.status} - ${loginRes.body}`);
    return null;
  }

  try {
    const body = JSON.parse(loginRes.body);
    // Handle kedua format response
    return body.data?.token || body.token;
  } catch {
    return null;
  }
}

/**
 * Headers standar dengan autentikasi
 * @param {string} token - Bearer token
 * @returns {object} Headers object
 */
export function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Headers tanpa autentikasi (untuk public endpoints)
 * @returns {object} Headers object
 */
export function publicHeaders() {
  return {
    Accept: "application/json",
  };
}

/**
 * Ambil daftar tenant
 * @returns {Array} Daftar tenant
 */
export function getTenants() {
  const res = http.get(`${BASE_URL}/api/v1/tenants`, {
    headers: publicHeaders(),
    tags: { type: "read", endpoint: "tenants" },
  });

  readLatency.add(res.timings.duration);
  requestCount.add(1);

  const success = check(res, {
    "get tenants status 200": (r) => r.status === 200,
  });

  errorRate.add(!success);

  if (success) {
    try {
      const body = JSON.parse(res.body);
      return body.data || [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Ambil menu dari tenant tertentu
 * @param {number} tenantId - ID tenant
 * @returns {Array} Daftar menu
 */
export function getTenantMenus(tenantId) {
  const res = http.get(`${BASE_URL}/api/v1/tenants/${tenantId}/menus`, {
    headers: publicHeaders(),
    tags: { type: "read", endpoint: "tenant_menus" },
  });

  readLatency.add(res.timings.duration);
  requestCount.add(1);

  const success = check(res, {
    "get tenant menus status 200": (r) => r.status === 200,
  });

  errorRate.add(!success);

  if (success) {
    try {
      const body = JSON.parse(res.body);
      return body.data || [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Buat order baru
 * @param {string} token - Bearer token
 * @param {number} tenantId - ID tenant
 * @param {Array} items - Array of {menu_id, qty}
 * @returns {object|null} Order yang dibuat
 */
export function createOrder(token, tenantId, items) {
  const orderPayload = JSON.stringify({
    tenant_id: tenantId,
    type: "pickup",
    items: items,
  });

  const res = http.post(`${BASE_URL}/api/v1/orders`, orderPayload, {
    headers: authHeaders(token),
    tags: { type: "write", endpoint: "create_order" },
  });

  writeLatency.add(res.timings.duration);
  requestCount.add(1);

  const success = check(res, {
    "create order status 201": (r) => r.status === 201,
  });

  errorRate.add(!success);

  if (!success) {
    console.warn(`Create order failed: ${res.status} - ${res.body}`);
  }

  if (success) {
    try {
      const body = JSON.parse(res.body);
      return body.data || null;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Ambil daftar order milik user
 * @param {string} token - Bearer token
 * @returns {Array} Daftar order
 */
export function getMyOrders(token) {
  const res = http.get(`${BASE_URL}/api/v1/orders`, {
    headers: authHeaders(token),
    tags: { type: "read", endpoint: "my_orders" },
  });

  readLatency.add(res.timings.duration);
  requestCount.add(1);

  const success = check(res, {
    "get my orders status 200": (r) => r.status === 200,
  });

  errorRate.add(!success);

  if (success) {
    try {
      const body = JSON.parse(res.body);
      return body.data || [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Random sleep untuk mensimulasikan user think time
 * @param {number} min - Minimum seconds
 * @param {number} max - Maximum seconds
 */
export function randomSleep(min = 1, max = 3) {
  sleep(Math.random() * (max - min) + min);
}

/**
 * Pilih item random dari array
 * @param {Array} arr - Array input
 * @returns {*} Random item
 */
export function randomItem(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate random quantity
 * @param {number} min - Minimum qty
 * @param {number} max - Maximum qty
 * @returns {number}
 */
export function randomQty(min = 1, max = 5) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
