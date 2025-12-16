/**
 * Skenario 2 - Pembuatan Pesanan (Write-heavy)
 *
 * Tujuan: Menguji kemampuan sistem saat banyak user melakukan checkout
 *         pesanan dalam waktu hampir bersamaan.
 *
 * Endpoints:
 * - POST /api/v1/orders
 * - GET /api/v1/orders (daftar pesanan milik user)
 *
 * Pola beban:
 * - 30 virtual users (VU)
 * - Durasi: 10 menit
 * - Ramp-up 1 menit
 * - Data pesanan di-generate acak
 *
 * Jalankan dengan:
 *   k6 run scenario-2-ordering.js
 *
 * Atau dengan credentials:
 *   k6 run -e BASE_URL=https://api.example.com \
 *          -e TEST_EMAIL=test@example.com \
 *          -e TEST_PASSWORD=secret123 \
 *          scenario-2-ordering.js
 */

import { sleep } from "k6";
import { SharedArray } from "k6/data";
import { BASE_URL, THRESHOLDS } from "./config.js";
import {
  login,
  getTenants,
  getTenantMenus,
  createOrder,
  getMyOrders,
  randomSleep,
  randomItem,
  randomQty,
  errorRate,
  readLatency,
  writeLatency,
  requestCount,
} from "./helpers.js";

// Export metrics
export { errorRate, readLatency, writeLatency, requestCount };

// Konfigurasi test
export const options = {
  scenarios: {
    ordering: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 30 }, // Ramp-up ke 30 VU dalam 1 menit
        { duration: "9m", target: 30 }, // Stabil di 30 VU selama 9 menit
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.02"], // Toleransi error sedikit lebih tinggi untuk write
    write_latency: ["p(95)<400", "p(99)<600"],
    errors: ["rate<0.02"],
  },
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
};

// Setup - login dan ambil data tenant/menu
export function setup() {
  console.log(`Starting Scenario 2 - Ordering Test`);
  console.log(`Base URL: ${BASE_URL}`);

  // Login untuk mendapatkan token
  const token = login();

  if (!token) {
    console.error("Failed to login! Check credentials in config.js");
    return { token: null, tenants: [], menusByTenant: {} };
  }

  console.log("Login successful");

  // Ambil daftar tenant
  const tenants = getTenants();
  console.log(`Found ${tenants.length} tenants`);

  // Ambil menu untuk setiap tenant
  const menusByTenant = {};
  for (const tenant of tenants) {
    if (tenant && tenant.id) {
      const menus = getTenantMenus(tenant.id);
      if (menus.length > 0) {
        menusByTenant[tenant.id] = menus;
      }
    }
  }

  console.log(`Loaded menus for ${Object.keys(menusByTenant).length} tenants`);

  return { token, tenants, menusByTenant };
}

// Main VU function
export default function (data) {
  const { token, tenants, menusByTenant } = data;

  if (!token) {
    console.error("No auth token available");
    sleep(5);
    return;
  }

  if (tenants.length === 0) {
    console.error("No tenants available");
    sleep(5);
    return;
  }

  // Pilih tenant random yang punya menu
  const tenantsWithMenu = tenants.filter(
    (t) => menusByTenant[t.id] && menusByTenant[t.id].length > 0
  );

  if (tenantsWithMenu.length === 0) {
    console.error("No tenants with menu available");
    sleep(5);
    return;
  }

  const selectedTenant = randomItem(tenantsWithMenu);
  const menus = menusByTenant[selectedTenant.id];

  // Generate random order items (1-3 items)
  const numItems = Math.floor(Math.random() * 3) + 1;
  const selectedMenus = [];
  const usedMenuIds = new Set();

  for (let i = 0; i < numItems && i < menus.length; i++) {
    let menu = randomItem(menus);
    // Pastikan menu unik
    let attempts = 0;
    while (usedMenuIds.has(menu.id) && attempts < 10) {
      menu = randomItem(menus);
      attempts++;
    }
    if (!usedMenuIds.has(menu.id)) {
      usedMenuIds.add(menu.id);
      selectedMenus.push({
        menu_id: menu.id,
        qty: randomQty(1, 3),
      });
    }
  }

  if (selectedMenus.length === 0) {
    console.warn("No menus could be selected");
    sleep(2);
    return;
  }

  // Buat pesanan
  const order = createOrder(token, selectedTenant.id, selectedMenus);

  // Think time setelah order
  randomSleep(2, 4);

  // Lihat daftar pesanan
  getMyOrders(token);

  // Think time sebelum repeat
  randomSleep(3, 6);
}

// Teardown
export function teardown(data) {
  console.log("Scenario 2 - Ordering Test completed");
}

// Handle summary
export function handleSummary(data) {
  const now = new Date().toISOString().replace(/[:.]/g, "-");

  return {
    stdout: textSummary(data, { indent: "  ", enableColors: true }),
    [`results/scenario-2-ordering-${now}.json`]: JSON.stringify(data, null, 2),
  };
}

function textSummary(data, opts) {
  const lines = [];
  lines.push("");
  lines.push("=".repeat(60));
  lines.push("  SKENARIO 2 - PEMBUATAN PESANAN (WRITE-HEAVY)");
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

    // Write Latency
    if (data.metrics.write_latency) {
      const w = data.metrics.write_latency.values;
      lines.push("Write Latency (POST /orders):");
      lines.push(`  avg: ${w.avg?.toFixed(2) || "N/A"} ms`);
      lines.push(`  p95: ${w["p(95)"]?.toFixed(2) || "N/A"} ms`);
      lines.push(`  p99: ${w["p(99)"]?.toFixed(2) || "N/A"} ms`);
      lines.push("");
    }

    // Read Latency
    if (data.metrics.read_latency) {
      const r = data.metrics.read_latency.values;
      lines.push("Read Latency (GET /orders):");
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
