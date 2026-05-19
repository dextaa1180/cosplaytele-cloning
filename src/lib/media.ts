export function shouldBypassImageOptimizer(src: string) {
  return /^https?:\/\//.test(src);
}
