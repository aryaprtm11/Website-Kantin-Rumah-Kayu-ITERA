/**
 * Script untuk menjalankan semua skenario performance test secara berurutan
 *
 * Jalankan dengan:
 *   k6 run run-all-scenarios.js
 */

import { sleep } from "k6";
import exec from "k6/execution";
import { BASE_URL, TEST_USER } from "./config.js";
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

export { errorRate, readLatency, writeLatency, requestCount };

// Konfigurasi dengan semua skenario
export const options = {
  scenarios: {
    // Skenario 1: Browsing (Read-heavy)
    scenario_1_browsing: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 50 },
        { duration: "4m", target: 50 },
      ],
      gracefulRampDown: "30s",
      exec: "browsingScenario",
      tags: { scenario: "browsing" },
    },
    // Skenario 2: Ordering (Write-heavy)
    scenario_2_ordering: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 30 },
        { duration: "4m", target: 30 },
      ],
      gracefulRampDown: "30s",
      startTime: "6m", // Mulai setelah skenario 1 selesai
      exec: "orderingScenario",
      tags: { scenario: "ordering" },
    },
    // Skenario 3: Mixed Load
    scenario_3_mixed: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 80 },
        { duration: "6m", target: 80 },
      ],
      gracefulRampDown: "30s",
      startTime: "12m", // Mulai setelah skenario 2 selesai
      exec: "mixedScenario",
      tags: { scenario: "mixed" },
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.02"],
    read_latency: ["p(95)<250"],
    write_latency: ["p(95)<500"],
    errors: ["rate<0.02"],
  },
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
};

// Global data dari setup
let setupData = {};

export function setup() {
  console.log("=".repeat(60));
  console.log("  KANTIN RK ITERA - FULL PERFORMANCE TEST");
  console.log("=".repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log("");

  // Login
  const token = login();
  if (token) {
    console.log("✓ Login successful");
  } else {
    console.warn("✗ Login failed - write tests will fail");
  }

  // Get tenants
  const tenants = getTenants();
  console.log(`✓ Found ${tenants.length} tenants`);

  // Get menus
  const menusByTenant = {};
  for (const tenant of tenants) {
    if (tenant && tenant.id) {
      const menus = getTenantMenus(tenant.id);
      if (menus.length > 0) {
        menusByTenant[tenant.id] = menus;
      }
    }
  }
  console.log(
    `✓ Loaded menus for ${Object.keys(menusByTenant).length} tenants`
  );
  console.log("");
  console.log("Starting tests...");
  console.log("");

  return { token, tenants, menusByTenant };
}

// Skenario 1: Browsing
export function browsingScenario(data) {
  const { tenants, menusByTenant } = data;

  getTenants();
  randomSleep(1, 2);

  if (tenants.length > 0) {
    const tenant = randomItem(tenants);
    if (tenant && tenant.id) {
      getTenantMenus(tenant.id);
      randomSleep(2, 4);
    }
  }

  randomSleep(2, 4);
}

// Skenario 2: Ordering
export function orderingScenario(data) {
  const { token, tenants, menusByTenant } = data;

  if (!token) {
    sleep(5);
    return;
  }

  const tenantsWithMenu = tenants.filter(
    (t) => menusByTenant[t.id] && menusByTenant[t.id].length > 0
  );

  if (tenantsWithMenu.length === 0) {
    sleep(5);
    return;
  }

  const selectedTenant = randomItem(tenantsWithMenu);
  const menus = menusByTenant[selectedTenant.id];

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
    createOrder(token, selectedTenant.id, selectedMenus);
    randomSleep(2, 4);
    getMyOrders(token);
  }

  randomSleep(3, 6);
}

// Skenario 3: Mixed
export function mixedScenario(data) {
  const { token, tenants, menusByTenant } = data;
  const isRead = Math.random() < 0.7;

  if (isRead) {
    // Read operation
    getTenants();
    randomSleep(1, 2);

    if (tenants.length > 0) {
      const tenant = randomItem(tenants);
      if (tenant && tenant.id) {
        getTenantMenus(tenant.id);
      }
    }
    randomSleep(2, 4);
  } else {
    // Write operation
    if (!token) {
      getTenants();
      randomSleep(2, 3);
      return;
    }

    const tenantsWithMenu = tenants.filter(
      (t) => menusByTenant[t.id] && menusByTenant[t.id].length > 0
    );

    if (tenantsWithMenu.length === 0) {
      getTenants();
      randomSleep(2, 3);
      return;
    }

    const selectedTenant = randomItem(tenantsWithMenu);
    const menus = menusByTenant[selectedTenant.id];

    getTenants();
    randomSleep(0.5, 1);
    getTenantMenus(selectedTenant.id);
    randomSleep(1, 2);

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
      createOrder(token, selectedTenant.id, selectedMenus);
      randomSleep(2, 3);
      getMyOrders(token);
    }

    randomSleep(2, 5);
  }
}

export function teardown(data) {
  console.log("");
  console.log("=".repeat(60));
  console.log("  ALL PERFORMANCE TESTS COMPLETED");
  console.log("=".repeat(60));
}

export function handleSummary(data) {
  const now = new Date().toISOString().replace(/[:.]/g, "-");

  return {
    stdout: textSummary(data),
    [`results/full-test-${now}.json`]: JSON.stringify(data, null, 2),
  };
}

function textSummary(data) {
  const lines = [];
  lines.push("");
  lines.push("=".repeat(70));
  lines.push("  KANTIN RK ITERA - PERFORMANCE TEST RESULTS");
  lines.push("=".repeat(70));
  lines.push("");

  if (data.metrics) {
    if (data.metrics.http_req_duration) {
      const d = data.metrics.http_req_duration.values;
      lines.push("Overall HTTP Request Duration:");
      lines.push(
        `  avg: ${d.avg?.toFixed(2) || "N/A"} ms | p95: ${
          d["p(95)"]?.toFixed(2) || "N/A"
        } ms | p99: ${d["p(99)"]?.toFixed(2) || "N/A"} ms`
      );
      lines.push("");
    }

    if (data.metrics.read_latency) {
      const r = data.metrics.read_latency.values;
      lines.push("Read Latency:");
      lines.push(
        `  avg: ${r.avg?.toFixed(2) || "N/A"} ms | p95: ${
          r["p(95)"]?.toFixed(2) || "N/A"
        } ms | p99: ${r["p(99)"]?.toFixed(2) || "N/A"} ms`
      );
      lines.push("");
    }

    if (data.metrics.write_latency) {
      const w = data.metrics.write_latency.values;
      lines.push("Write Latency:");
      lines.push(
        `  avg: ${w.avg?.toFixed(2) || "N/A"} ms | p95: ${
          w["p(95)"]?.toFixed(2) || "N/A"
        } ms | p99: ${w["p(99)"]?.toFixed(2) || "N/A"} ms`
      );
      lines.push("");
    }

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
  lines.push("=".repeat(70));

  return lines.join("\n");
}
