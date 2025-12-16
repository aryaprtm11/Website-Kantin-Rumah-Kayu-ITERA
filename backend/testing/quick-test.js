/**
 * Quick Test - Verifikasi Setup
 *
 * Script sederhana untuk memastikan setup k6 sudah benar sebelum menjalankan
 * full performance test. Durasi pendek dengan jumlah VU minimal.
 *
 * Jalankan dengan:
 *   k6 run quick-test.js
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, TEST_USER } from "./config.js";
import {
  login,
  getTenants,
  getTenantMenus,
  createOrder,
  getMyOrders,
  randomItem,
  randomQty,
} from "./helpers.js";

export const options = {
  vus: 5,
  duration: "1m",
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    http_req_failed: ["rate<0.1"],
  },
};

export function setup() {
  console.log("");
  console.log("=".repeat(50));
  console.log("  QUICK TEST - VERIFIKASI SETUP");
  console.log("=".repeat(50));
  console.log("");
  console.log(`Base URL: ${BASE_URL}`);
  console.log("");

  // Test 1: API Health Check
  console.log("[1/4] Testing API connectivity...");
  const healthRes = http.get(`${BASE_URL}/api/v1/tenants`);
  const apiOk = check(healthRes, {
    "API is reachable": (r) => r.status === 200 || r.status === 401,
  });
  console.log(apiOk ? "  ✓ API is reachable" : "  ✗ API connection failed");

  // Test 2: Login
  console.log("[2/4] Testing login...");
  const token = login();
  console.log(token ? "  ✓ Login successful" : "  ✗ Login failed");

  // Test 3: Get Tenants
  console.log("[3/4] Getting tenants...");
  const tenants = getTenants();
  console.log(
    tenants.length > 0
      ? `  ✓ Found ${tenants.length} tenants`
      : "  ✗ No tenants found"
  );

  // Test 4: Get Menus
  console.log("[4/4] Getting menus...");
  const menusByTenant = {};
  let totalMenus = 0;
  for (const tenant of tenants.slice(0, 3)) {
    // Ambil max 3 tenant
    if (tenant && tenant.id) {
      const menus = getTenantMenus(tenant.id);
      if (menus.length > 0) {
        menusByTenant[tenant.id] = menus;
        totalMenus += menus.length;
      }
    }
  }
  console.log(
    totalMenus > 0
      ? `  ✓ Found ${totalMenus} menus from ${
          Object.keys(menusByTenant).length
        } tenants`
      : "  ✗ No menus found"
  );

  console.log("");

  // Summary
  const allOk = apiOk && token && tenants.length > 0 && totalMenus > 0;
  if (allOk) {
    console.log("✓ All checks passed! Ready for performance testing.");
  } else {
    console.log("✗ Some checks failed. Please fix before running full tests.");
  }

  console.log("");
  console.log("Starting quick load test (5 VUs, 1 minute)...");
  console.log("");

  return { token, tenants, menusByTenant };
}

export default function (data) {
  const { token, tenants, menusByTenant } = data;

  // Simple browsing test
  getTenants();
  sleep(1);

  if (tenants.length > 0) {
    const tenant = randomItem(tenants);
    if (tenant && tenant.id) {
      getTenantMenus(tenant.id);
    }
  }

  // Optional: create order if we have token and menus
  if (token && Object.keys(menusByTenant).length > 0) {
    const tenantsWithMenu = tenants.filter((t) => menusByTenant[t.id]);

    if (tenantsWithMenu.length > 0 && Math.random() > 0.7) {
      const selectedTenant = randomItem(tenantsWithMenu);
      const menus = menusByTenant[selectedTenant.id];

      if (menus && menus.length > 0) {
        const menu = randomItem(menus);
        createOrder(token, selectedTenant.id, [{ menu_id: menu.id, qty: 1 }]);
      }
    }
  }

  sleep(2);
}

export function teardown(data) {
  console.log("");
  console.log("Quick test completed!");
  console.log("");
  console.log("Next steps:");
  console.log("  1. Run individual scenarios:");
  console.log("     k6 run scenario-1-browsing.js");
  console.log("     k6 run scenario-2-ordering.js");
  console.log("     k6 run scenario-3-mixed.js");
  console.log("");
  console.log("  2. Or run all scenarios:");
  console.log("     k6 run run-all-scenarios.js");
  console.log("");
}
