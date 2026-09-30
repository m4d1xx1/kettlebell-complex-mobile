/** These authored loops contain one left and one right repetition. */
const pairedLoops = new Set(['farmer-march', 'front-rack-march', 'mountain-climber', 'high-knees', 'bodyweight-reverse-lunge']);
export function remainingReps(target: number, elapsedMs: number, secondsPerRep: number): number {
  return Math.max(0, target - Math.floor(elapsedMs / (secondsPerRep * 1000)));
}
export function repPlayback(exerciseId: string | undefined, elapsedMs: number, secondsPerRep: number) {
  const paired = pairedLoops.has(exerciseId ?? '');
  const position = elapsedMs / (secondsPerRep * 1000 * (paired ? 2 : 1));
  return { progress: position % 1, cycle: Math.floor(position), paired };
}
