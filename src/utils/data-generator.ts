// Utility: Generates mock HCP (Healthcare Professional) data
// Uses seeded random number generator for reproducible test data
// Includes intentional edge cases (duplicates, nulls, invalid types) for testing

export interface HcpRecord {
  id: string;
  name: string;
  specialty: string | null;
  region: string;
  territory: string;
  calls: number | string; // Mixed type to test normalization
  trx: number;
  nrx: number;
}

// Lookup tables for random data generation
const FIRST = [
  "Anita",
  "Rahul",
  "Meera",
  "Vikram",
  "Sara",
  "John",
  "Priya",
  "David",
  "Chen",
  "Fatima",
  "Luis",
  "Emma",
  "Ravi",
  "Nina",
  "Omar",
  "Kavya",
];
const LAST = [
  "Sharma",
  "Patel",
  "Iyer",
  "Khan",
  "Smith",
  "Garcia",
  "Wang",
  "Mehta",
  "Rao",
  "Fernandez",
  "Kim",
  "Osei",
  "Kulkarni",
  "Das",
  "Bose",
  "Nair",
];
const SPECIALTIES = [
  "Oncology",
  "Cardiology",
  "Neurology",
  "Endocrinology",
  "Immunology",
  "Dermatology",
  "Psychiatry",
  "Pulmonology",
];
const REGIONS = [
  "Midwest",
  "National",
  "Northeast",
  "Southeast",
  "Southwest",
  "West",
];

// Seeded PRNG (Pseudo-Random Number Generator) using Mulberry32 algorithm
// Ensures reproducible test data across runs
function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate n rows of mock HCP data with intentional edge cases
// Edge cases: duplicate IDs (every 9973 rows), null specialties (every 97 rows),
// string calls (every 211 rows), extreme values (every 12007 rows), zero TRx (every 577 rows)
export function generateRows(seed = 42, n = 50000): HcpRecord[] {
  const rand = mulberry32(seed);
  const rows: HcpRecord[] = new Array(n);
  for (let i = 0; i < n; i++) {
    let id = "HCP-" + String(i + 1).padStart(6, "0");
    if (i > 0 && i % 9973 === 0) id = rows[i - 1].id; // Duplicate ID test
    let specialty: string | null =
      SPECIALTIES[(rand() * SPECIALTIES.length) | 0];
    if (i > 0 && i % 97 === 0) specialty = null; // Null specialty test
    let calls: number | string = Math.round(rand() * 40);
    if (i > 0 && i % 211 === 0) calls = String(calls); // String type test
    if (i > 0 && i % 12007 === 0) calls = 99999; // Extreme value test
    let trx = Math.round(rand() * 900);
    if (i > 0 && i % 577 === 0) trx = 0; // Zero TRx test (division by zero case)
    const region = REGIONS[(rand() * REGIONS.length) | 0];
    rows[i] = {
      id,
      name:
        FIRST[(rand() * FIRST.length) | 0] +
        " " +
        LAST[(rand() * LAST.length) | 0],
      specialty,
      region,
      territory: region + " / T" + (1 + ((rand() * 8) | 0)),
      calls,
      trx,
      nrx: Math.round(rand() * 300),
    };
  }
  return rows;
}
