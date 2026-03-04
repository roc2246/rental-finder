import { describe, it, expect } from 'vitest';
import router from '../index.js';

// helper to find route paths inside router.stack
function getPaths(r) {
  return r.stack
    .filter((layer) => layer.route)
    .map((layer) => layer.route.path);
}

describe('API router', () => {
  it('should expose /rentals and /listings endpoints', () => {
    const paths = getPaths(router);
    expect(paths).toContain('/rentals');
    expect(paths).toContain('/listings');
  });
});
