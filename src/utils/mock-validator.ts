// Utility: Mock validation service for edit operations
// Simulates async API validation with artificial latency and random failures
// Used to demonstrate optimistic UI updates with rollback on error

const CALL_CAP = 60; // Maximum allowed calls per HCP
const RANDOM_FAILURE_RATE = 0.1; // 10% chance of random service failure

// Validate calls value against business rules
// Simulates async validation with 300-900ms latency
// Rejects if value exceeds cap or if random service failure occurs
export function validateCalls(newValue: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const latency = 300 + Math.random() * 600; // 300-900ms simulated network delay
    setTimeout(() => {
      if (newValue > CALL_CAP) {
        reject(`exceeds per-HCP call cap (${CALL_CAP})`);
      } else if (Math.random() < RANDOM_FAILURE_RATE) {
        reject("validation service 503"); // Simulate server error
      } else {
        resolve();
      }
    }, latency);
  });
}
