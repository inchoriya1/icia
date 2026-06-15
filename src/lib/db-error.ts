export async function withDbFallback<T>(
  fallback: T,
  fn: () => Promise<T>,
): Promise<{ data: T; dbUnavailable: boolean }> {
  try {
    return { data: await fn(), dbUnavailable: false };
  } catch {
    return { data: fallback, dbUnavailable: true };
  }
}
