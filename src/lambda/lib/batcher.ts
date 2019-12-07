const batchSize = 1;
export default function batcher(acc, current: any, index: number) : any[] {
  const batch = Math.floor(index/batchSize);
  acc.length = batch + 1;
  if (!Array.isArray(acc[batch])) acc[batch] = [];
  acc[batch] = [ ...acc[batch], current ];
  return acc;
}
