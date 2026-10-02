/* Simulated async API layer over the local mock-data modules.
   Pages use these to demonstrate loading / error / retry states.
   All data stays local — no network, no backend. */

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jittered(base = 500, spread = 350) {
  return base + Math.floor(Math.random() * spread);
}

/* Run a synchronous selector with a simulated network delay. */
export async function simulateFetch(selector, ms) {
  await delay(ms === undefined ? jittered() : ms);
  return selector();
}

/* Simulate a mutation (create/update/delete) with a delay. */
export async function simulateMutation(mutator, ms = 650) {
  await delay(ms);
  return mutator();
}

/* Error-simulation helper: pages can set `?simulate=error` or a local toggle
   to force a rejected promise and render the error state. */
export async function simulateFetchWithError(selector, shouldFail, ms) {
  await delay(ms === undefined ? jittered() : ms);
  if (shouldFail) {
    throw new Error('Simulated request failure. The mock service is temporarily unavailable.');
  }
  return selector();
}
