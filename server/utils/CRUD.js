export async function manageBatchSize(batchSize, data, modelFunct) {
  const BATCH_SIZE = batchSize;
  let addedCount = 0;
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    console.log(batch)
    const settled = await Promise.allSettled(
      batch.map((r) => modelFunct(r)),
    );
    settled.forEach((res) => {
      if (res.status === "fulfilled" && res.value) addedCount++;
    });
  }
  console.log(`Added ${addedCount} rentals to the database.`);
}
