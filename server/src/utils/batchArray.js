export function batchArray(items, batchSize) {
  if (batchSize <= 0) {
    throw new Error("batchSize must be a positive number");
  }

  const batches = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}
