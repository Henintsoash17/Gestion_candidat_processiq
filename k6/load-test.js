/**
 * Test de charge k6 — à lancer contre l’API backend (local ou déployée).
 *
 * Exemple :
 *   k6 run -e BASE_URL=http://localhost:5000 k6/load-test.js
 *
 * Un 401 sur /api/candidates sans jeton est attendu ; l’objectif est de mesurer la latence et la disponibilité.
 */
import http from "k6/http";
import { check, sleep } from "k6";

const baseUrl = __ENV.BASE_URL || "http://localhost:5000";

export const options = {
  vus: 10,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.05"],
  },
};

export default function () {
  const res = http.get(`${baseUrl}/api/candidates?page=1&limit=5`);
  check(res, {
    "status 401 ou 200": (r) => r.status === 401 || r.status === 200,
  });
  sleep(0.3);
}
