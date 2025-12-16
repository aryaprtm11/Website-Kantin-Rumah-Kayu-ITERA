/**
 * Konfigurasi untuk Performance Testing Kantin RK ITERA
 * Sesuaikan BASE_URL dengan environment yang ingin diuji
 */

// Base URL untuk API backend
// Ganti dengan URL production/staging sesuai kebutuhan
export const BASE_URL = "https://kantin-backend-104030083079.asia-southeast2.run.app";

// Credentials untuk testing
// Default menggunakan customer dari DemoDataSeeder
export const TEST_USER = {
  email: "customer@example.com",
  password: "password",
};

// Thresholds untuk performance (sesuaikan dengan SLA)
export const THRESHOLDS = {
  // Response time thresholds
  http_req_duration: ["p(95)<500", "p(99)<1000"], // 95% < 500ms, 99% < 1000ms
  http_req_failed: ["rate<0.01"], // Error rate < 1%

  // Custom thresholds per endpoint type
  "http_req_duration{type:read}": ["p(95)<200", "p(99)<300"],
  "http_req_duration{type:write}": ["p(95)<400", "p(99)<600"],
};

// Scenario configurations
export const SCENARIO_CONFIG = {
  // Skenario 1: Browsing (Read-heavy)
  browsing: {
    vus: 50,
    duration: "10m",
    rampUp: "2m",
  },
  // Skenario 2: Order Creation (Write-heavy)
  ordering: {
    vus: 30,
    duration: "10m",
    rampUp: "1m",
  },
  // Skenario 3: Mixed Load
  mixed: {
    vus: 80,
    duration: "15m",
    rampUp: "2m",
    readRatio: 0.7, // 70% read
    writeRatio: 0.3, // 30% write
  },
};
