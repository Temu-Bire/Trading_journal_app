/**
 * Integration Test: Frontend <-> Backend Connectivity Test
 * Verifies backend availability, database connection, CORS policies,
 * and API route responses.
 */

const BACKEND_URL = process.env.API_URL || "http://localhost:5000";
const FRONTEND_ORIGIN = "http://localhost:3000";

async function testConnection() {
  console.log("==================================================");
  console.log(" 🧪 TESTING FRONTEND <-> BACKEND CONNECTION");
  console.log("==================================================");
  console.log(`Backend Target URL: ${BACKEND_URL}`);
  console.log(`Frontend Origin:     ${FRONTEND_ORIGIN}\n`);

  let allPassed = true;

  // 1. Test Base API Endpoint
  try {
    const res = await fetch(`${BACKEND_URL}/api`);
    const data = await res.json();
    if (res.ok && data.success) {
      console.log("✅ 1. Base API Endpoint (/api): ONLINE");
      console.log(`   Message: "${data.message}" [${data.timestamp}]`);
    } else {
      console.error("❌ 1. Base API Endpoint (/api): Unexpected response", data);
      allPassed = false;
    }
  } catch (err) {
    console.error("❌ 1. Base API Endpoint (/api): FAILED to connect", err.message);
    allPassed = false;
  }

  // 2. Test Health Check & Database Connectivity
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`);
    const data = await res.json();
    if (res.ok && data.status === "healthy" && data.services?.database?.connected) {
      console.log("✅ 2. Backend Health & Database (/api/health): HEALTHY");
      console.log(`   Database Status: ${data.services.database.status} (Connected: true)`);
      console.log(`   Uptime:          ${Math.round(data.uptime)}s`);
    } else {
      console.error("❌ 2. Backend Health (/api/health): DEGRADED or DB DISCONNECTED", data);
      allPassed = false;
    }
  } catch (err) {
    console.error("❌ 2. Backend Health (/api/health): FAILED", err.message);
    allPassed = false;
  }

  // 3. Test CORS Configuration for Frontend Origin
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, {
      method: "GET",
      headers: {
        Origin: FRONTEND_ORIGIN,
      },
    });
    const allowOrigin = res.headers.get("access-control-allow-origin");
    const allowCredentials = res.headers.get("access-control-allow-credentials");

    if (allowOrigin === FRONTEND_ORIGIN) {
      console.log("✅ 3. CORS Configuration: PROPERLY CONFIGURED");
      console.log(`   Access-Control-Allow-Origin:      ${allowOrigin}`);
      console.log(`   Access-Control-Allow-Credentials: ${allowCredentials}`);
    } else {
      console.warn(`⚠️ 3. CORS Warning: Allow-Origin is "${allowOrigin}" (Expected: "${FRONTEND_ORIGIN}")`);
    }
  } catch (err) {
    console.error("❌ 3. CORS Test: FAILED", err.message);
    allPassed = false;
  }

  // 4. Test API Auth Endpoint (v1)
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: FRONTEND_ORIGIN,
      },
      body: JSON.stringify({
        email: "nonexistent_trader_check@example.com",
        password: "TestPassword123!",
      }),
    });
    const data = await res.json();
    // Expected to return 401 Invalid credentials (proving API processing works)
    if (res.status === 401 && data.success === false) {
      console.log("✅ 4. Auth Endpoint (/api/v1/auth/login): FULLY OPERATIONAL");
      console.log(`   Response status: 401 (Proper rejection for test credentials)`);
      console.log(`   Response message: "${data.message}"`);
    } else {
      console.error("❌ 4. Auth Endpoint: Unexpected response", res.status, data);
      allPassed = false;
    }
  } catch (err) {
    console.error("❌ 4. Auth Endpoint: FAILED", err.message);
    allPassed = false;
  }

  // 5. Protected Endpoint Guard Check
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/trades`, {
      headers: {
        Origin: FRONTEND_ORIGIN,
      },
    });
    const data = await res.json();
    if (res.status === 401 && data.success === false) {
      console.log("✅ 5. Trade API Route Guard (/api/v1/trades): PROTECTED");
      console.log(`   Response status: 401 Unauthorized (JWT Guard active)`);
    } else {
      console.error("❌ 5. Trade API Guard: Unexpected response", res.status, data);
      allPassed = false;
    }
  } catch (err) {
    console.error("❌ 5. Trade API Guard: FAILED", err.message);
    allPassed = false;
  }

  console.log("\n==================================================");
  if (allPassed) {
    console.log(" 🎉 ALL FRONTEND <-> BACKEND TESTS PASSED!");
  } else {
    console.log(" ⚠️ SOME CHECKS REPORTED ISSUES");
  }
  console.log("==================================================");

  process.exit(allPassed ? 0 : 1);
}

testConnection();
