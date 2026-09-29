/** Calendar changes must never advance or rewind a running workout. */
export const monotonicNow = () => performance.now();
