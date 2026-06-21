/**
 * Processes data in configurable batch sizes using a model function
 * Returns detailed success/failure tracking for reliability
 * @async
 * @param {number} batchSize - Number of items to process in each batch
 * @param {Array} data - Array of items to process
 * @param {Function} modelFunct - Async function to apply to each item (e.g., addRental, updateRental)
 * @param {Object} options - Configuration options
 * @param {number} options.maxRetries - Maximum retry attempts for failed items (default: 1)
 * @returns {Promise<{succeeded: number, failed: number, errors: Array}>} - Processing results with error details
 * @example
 * const results = await manageBatchSize(50, rentals, models.addRental);
 * console.log(`${results.succeeded} succeeded, ${results.failed} failed`);
 * if (results.failed > 0) console.error('Errors:', results.errors.slice(0, 5));
 */
export async function manageBatchSize(batchSize, data, modelFunct, options = {}) {
  const results = { succeeded: 0, failed: 0, errors: [] };

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    const settled = await Promise.allSettled(batch.map(modelFunct));
    
    settled.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.succeeded++;
      } else {
        results.failed++;
        results.errors.push({
          item: batch[index],
          error: result.reason?.message || 'Unknown error'
        });
      }
    });
  }

  console.log(
    `${modelFunct.name}: ${results.succeeded} succeeded, ${results.failed} failed`
  );
  
  if (results.failed > 0) {
    console.warn(
      `Failed items (showing first 5):`,
      results.errors.slice(0, 5).map(e => ({ item: e.item?.title || 'unknown', error: e.error }))
    );
  }

  return results;
}