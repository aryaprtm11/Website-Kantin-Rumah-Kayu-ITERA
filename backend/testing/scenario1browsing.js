/**
 * Skenario 1 - Browsing Menu & Tenant (Read-heavy)
 *
 * Tujuan: Menguji performa endpoint baca (read) yang sering dipanggil user
 *         saat melihat daftar kantin dan menu.
 *
 * Endpoints:
 * - GET /api/v1/tenants
 * - GET /api/v1/tenants/{id}/menus
 *
 * Pola beban:
 * - 50 virtual users (VU)
 * - Durasi: 10 menit
 * - Ramp-up 2 menit, lalu stabil
 *
 * Jalankan dengan:
 *   k6 run scenario-1-browsing.js
 *
 * Atau dengan custom BASE_URL:
 *   k6 run -e BASE_URL=https://api.example.com scenario-1-browsing.js
 */

import { sleep } from "k6";
import { BASE_URL, THRESHOLDS, SCENARIO_CONFIG } from "./config.js";
import {
  getTenants,
  getTenantMenus,
  randomSleep,
  randomItem,
  errorRate,
  readLatency,
  requestCount,
} from "./helpers.js";

// Export metrics agar muncul di summary
export { errorRate, readLatency, requestCount };

// Konfigurasi test
export const options = {
  scenarios: {
    browsing: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "2m", target: 50 }, // Ramp-up ke 50 VU dalam 2 menit
        { duration: "8m", target: 50 }, // Stabil di 50 VU selama 8 menit
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<200", "p(99)<300"],
    http_req_failed: ["rate<0.01"],
    read_latency: ["p(95)<200", "p(99)<300"],
    errors: ["rate<0.01"],
  },
  // Output summary ke file JSON
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
};

// Setup function - dijalankan sekali sebelum test
export function setup() {
  console.log(`Starting Scenario 1 - Browsing Test`);
  console.log(`Base URL: ${BASE_URL}`);

  // Ambil daftar tenant untuk digunakan oleh VUs
  const tenants = getTenants();

  if (tenants.length === 0) {
    console.warn("No tenants found! Make sure database has tenant data.");
  } else {
    console.log(`Found ${tenants.length} tenants`);
  }

  return { tenants };
}

// Main VU function
export default function (data) {
  const { tenants } = data;

  // Simulasi user browsing: lihat daftar tenant
  getTenants();
  randomSleep(1, 2);

  // Pilih tenant random dan lihat menu-nya
  if (tenants.length > 0) {
    const tenant = randomItem(tenants);
    if (tenant && tenant.id) {
      getTenantMenus(tenant.id);
      randomSleep(2, 4);

      // Kadang user melihat menu tenant lain juga
      if (Math.random() > 0.5) {
        const anotherTenant = randomItem(tenants);
        if (
          anotherTenant &&
          anotherTenant.id &&
          anotherTenant.id !== tenant.id
        ) {
          getTenantMenus(anotherTenant.id);
          randomSleep(1, 3);
        }
      }
    }
  }

  // User think time sebelum repeat
  randomSleep(2, 5);
}

// Teardown function - dijalankan sekali setelah test
export function teardown(data) {
  console.log("Scenario 1 - Browsing Test completed");
}

// Handle summary untuk output yang lebih informatif
export function handleSummary(data) {
  const now = new Date().toISOString().replace(/[:.]/g, "-");

  return {
    stdout: textSummary(data, { indent: "  ", enableColors: true }),
    [`results/scenario-1-browsing-${now}.json`]: JSON.stringify(data, null, 2),
  };
}

// Text summary generator
function textSummary(data, opts) {
  const lines = [];
  lines.push("");
  lines.push("=".repeat(60));
  lines.push("  SKENARIO 1 - BROWSING MENU & TENANT (READ-HEAVY)");
  lines.push("=".repeat(60));
  lines.push("");

  if (data.metrics) {
    // HTTP Request Duration
    if (data.metrics.http_req_duration) {
      const d = data.metrics.http_req_duration.values;
      lines.push("HTTP Request Duration:");
      lines.push(`  avg: ${d.avg?.toFixed(2) || "N/A"} ms`);
      lines.push(`  p95: ${d["p(95)"]?.toFixed(2) || "N/A"} ms`);
      lines.push(`  p99: ${d["p(99)"]?.toFixed(2) || "N/A"} ms`);
      lines.push("");
    }

    // Read Latency
    if (data.metrics.read_latency) {
      const r = data.metrics.read_latency.values;
      lines.push("Read Latency:");
      lines.push(`  avg: ${r.avg?.toFixed(2) || "N/A"} ms`);
      lines.push(`  p95: ${r["p(95)"]?.toFixed(2) || "N/A"} ms`);
      lines.push(`  p99: ${r["p(99)"]?.toFixed(2) || "N/A"} ms`);
      lines.push("");
    }

    // Request count & errors
    if (data.metrics.http_reqs) {
      lines.push(`Total Requests: ${data.metrics.http_reqs.values.count}`);
      lines.push(
        `Throughput: ${
          data.metrics.http_reqs.values.rate?.toFixed(2) || "N/A"
        } req/s`
      );
    }

    if (data.metrics.http_req_failed) {
      lines.push(
        `Error Rate: ${
          (data.metrics.http_req_failed.values.rate * 100)?.toFixed(2) || "0"
        }%`
      );
    }
  }

  lines.push("");
  lines.push("=".repeat(60));

  return lines.join("\n");
}
