import { describe, expect, it } from 'vitest';
import { redirectFor, safeNextPath } from '@/lib/routes';

describe('redirectFor', () => {
  it('sends signed-out visitors from protected pages to /login with a next param', () => {
    expect(redirectFor('/notes', false)).toBe('/login?next=%2Fnotes');
    expect(redirectFor('/notes/abc', false)).toBe('/login?next=%2Fnotes%2Fabc');
  });

  it('sends signed-in users away from /login and /signup', () => {
    expect(redirectFor('/login', true)).toBe('/notes');
    expect(redirectFor('/signup', true)).toBe('/notes');
  });

  it('leaves everything else alone', () => {
    expect(redirectFor('/', false)).toBeNull();
    expect(redirectFor('/', true)).toBeNull();
    expect(redirectFor('/notes', true)).toBeNull();
    expect(redirectFor('/login', false)).toBeNull();
    expect(redirectFor('/notesy', false)).toBeNull();
  });
});

describe('safeNextPath', () => {
  it('accepts same-site paths', () => {
    expect(safeNextPath('/notes')).toBe('/notes');
    expect(safeNextPath('/notes?x=1')).toBe('/notes?x=1');
  });

  it.each(['https://evil.example', '//evil.example', '/\\evil.example', 'notes', '', null, undefined, 42])(
    'falls back for %j',
    (value) => {
      expect(safeNextPath(value)).toBe('/notes');
    },
  );
});
