export async function manageBatchSize(batchSize, data, modelFunct) {
  let addedCount = 0;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    const settled = await Promise.allSettled(batch.map(modelFunct));
    
    addedCount += settled.filter(
      (res) => res.status === "fulfilled" && res.value
    ).length;
  }

  console.log(`Added ${addedCount} rentals to the database.`);
}