export async function manageBatchSize(batchSize, data, modelFunct) {
  let count = 0;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    const settled = await Promise.allSettled(batch.map(modelFunct));
    
    count += settled.filter(
      (res) => res.status === "fulfilled" && res.value
    ).length;
  }

  console.log(`${count} rentals processed with ${modelFunct.name}`);
}