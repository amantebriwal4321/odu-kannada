import raw from "@/data/samples.json";
import type { Sample } from "@/lib/types";

export const samples = raw.samples as Sample[];

export function sampleById(id: string): Sample | undefined {
  return samples.find((sample) => sample.id === id);
}

export function sampleByHash(sha256: string): Sample | undefined {
  if (!sha256) return undefined;
  return samples.find((sample) => sample.sha256 === sha256);
}
