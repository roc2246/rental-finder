/**
 * Processes data in configurable batch sizes using a model function
 * Useful for throttling database operations or API calls
 * @async
 * @param {number} batchSize - Number of items to process in each batch
 * @param {Array} data - Array of items to process
 * @param {Function} modelFunct - Async function to apply to each item (e.g., addRental, updateRental)
 * @returns {Promise<void>}
 * @example
 * const rentals = [{...}, {...}, {...}];
 * await manageBatchSize(50, rentals, models.addRental);
 * // Will process 50 rentals at a time and log the count
 */
export async function manageBatchSize(batchSize, data, modelFunct) {
  let count = 0;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    const settled = await Promise.allSettled(batch.map(modelFunct));
    
    count += settled.filter(
      (res) => res.status === "fulfilled"
    ).length;
  }

  console.log(`${count} rentals processed with ${modelFunct.name}`);
}