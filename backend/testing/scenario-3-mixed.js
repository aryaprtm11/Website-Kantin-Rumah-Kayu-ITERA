/**
 * Skenario 3 - Mixed Load (Gabungan Browse + Order)
 *
 * Tujuan: Mensimulasikan kondisi jam makan siang, di mana sebagian user
 *         hanya melihat menu, sebagian lain membuat pesanan.
 *
 * Endpoints:
 * - GET /api/v1/tenants
 * - GET /api/v1/tenants/{id}/menus
 * - POST /api/v1/orders
 * - GET /api/v1/orders
 *
 * Pola beban:
 * - 80 virtual users (VU)
 * - Durasi: 15 menit
 * - Ramp-up 2 menit
 * - Rasio: 70% read, 30% write
 *
 * Jalankan dengan:
 *   k6 run scenario-3-mixed.js
 */

import { sleep } from "k6";
import { BASE_URL } from "./config.js";
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
    mixed_load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "2m", target: 80 }, // Ramp-up ke 80 VU dalam 2 menit
        { duration: "13m", target: 80 }, // Stabil di 80 VU selama 13 menit
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<400", "p(99)<600"],
    http_req_failed: ["rate<0.02"],
    read_latency: ["p(95)<250", "p(99)<350"],
    write_latency: ["p(95)<450", "p(99)<650"],
    errors: ["rate<0.02"],
  },
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
};

// Ratio read vs write (70% read, 30% write)
const READ_RATIO = 0.7;

// Setup
export function setup() {
  console.log(`Starting Scenario 3 - Mixed Load Test`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(
    `Read/Write Ratio: ${READ_RATIO * 100}% / ${(1 - READ_RATIO) * 100}%`
  );

  // Login untuk operasi write
  const token = login();

  if (!token) {
    console.warn("Failed to login! Write operations will fail.");
  } else {
    console.log("Login successful");
  }

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

  // Tentukan apakah VU ini akan melakukan read atau write
  const isReadOperation = Math.random() < READ_RATIO;

  if (isReadOperation) {
    // === READ OPERATION (Browsing) ===
    performBrowsing(tenants, menusByTenant);
  } else {
    // === WRITE OPERATION (Ordering) ===
    performOrdering(token, tenants, menusByTenant);
  }
}

/**
 * Simulasi browsing (read operations)
 */
function performBrowsing(tenants, menusByTenant) {
  // Lihat daftar tenant
  getTenants();
  randomSleep(1, 2);

  // Lihat menu dari beberapa tenant
  if (tenants.length > 0) {
    // Tenant pertama
    const tenant1 = randomItem(tenants);
    if (tenant1 && tenant1.id) {
      getTenantMenus(tenant1.id);
      randomSleep(2, 4);
    }

    // 50% chance lihat tenant lain
    if (Math.random() > 0.5 && tenants.length > 1) {
      const tenant2 = randomItem(tenants);
      if (tenant2 && tenant2.id) {
        getTenantMenus(tenant2.id);
        randomSleep(1, 3);
      }
    }
  }

  randomSleep(2, 4);
}

/**
 * Simulasi ordering (write operations)
 */
function performOrdering(token, tenants, menusByTenant) {
  if (!token) {
    // Fallback ke browsing jika tidak bisa login
    console.warn("No token, falling back to browsing");
    getTenants();
    randomSleep(2, 3);
    return;
  }

  // Filter tenant yang punya menu
  const tenantsWithMenu = tenants.filter(
    (t) => menusByTenant[t.id] && menusByTenant[t.id].length > 0
  );

  if (tenantsWithMenu.length === 0) {
    getTenants();
    randomSleep(2, 3);
    return;
  }

  // Pilih tenant
  const selectedTenant = randomItem(tenantsWithMenu);
  const menus = menusByTenant[selectedTenant.id];

  // Browsing dulu sebelum order (simulasi user)
  getTenants();
  randomSleep(0.5, 1);
  getTenantMenus(selectedTenant.id);
  randomSleep(1, 2);

  // Generate order items
  const numItems = Math.floor(Math.random() * 3) + 1;
  const selectedMenus = [];
  const usedMenuIds = new Set();

  for (let i = 0; i < numItems && i < menus.length; i++) {
    let menu = randomItem(menus);
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

  if (selectedMenus.length > 0) {
    // Buat order
    createOrder(token, selectedTenant.id, selectedMenus);
    randomSleep(2, 3);

    // Lihat daftar order
    getMyOrders(token);
  }

  randomSleep(2, 5);
}

// Teardown
export function teardown(data) {
  console.log("Scenario 3 - Mixed Load Test completed");
}

// Handle summary
export function handleSummary(data) {
  const now = new Date().toISOString().replace(/[:.]/g, "-");

  return {
    stdout: textSummary(data, { indent: "  ", enableColors: true }),
    [`results/scenario-3-mixed-${now}.json`]: JSON.stringify(data, null, 2),
  };
}

function textSummary(data, opts) {
  const lines = [];
  lines.push("");
  lines.push("=".repeat(60));
  lines.push("  SKENARIO 3 - MIXED LOAD (70% READ, 30% WRITE)");
  lines.push("=".repeat(60));
  lines.push("");

  if (data.metrics) {
    // HTTP Request Duration (Overall)
    if (data.metrics.http_req_duration) {
      const d = data.metrics.http_req_duration.values;
      lines.push("HTTP Request Duration (Overall):");
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

    // Write Latency
    if (data.metrics.write_latency) {
      const w = data.metrics.write_latency.values;
      lines.push("Write Latency:");
      lines.push(`  avg: ${w.avg?.toFixed(2) || "N/A"} ms`);
      lines.push(`  p95: ${w["p(95)"]?.toFixed(2) || "N/A"} ms`);
      lines.push(`  p99: ${w["p(99)"]?.toFixed(2) || "N/A"} ms`);
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
