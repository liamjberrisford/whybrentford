/** Resolve public assets under the deployment path, including GitHub Pages. */
export function publicAsset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}
