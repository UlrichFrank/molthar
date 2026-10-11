import { describe, expect, it } from 'vitest';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { MatchStore } from '../matchStore';

function metadata() {
  return {
    gameName: 'portale-von-molthar',
    players: { 0: { id: 0, name: 'Anna', credentials: 'geheim' } },
    createdAt: 1,
    updatedAt: Date.now(),
  };
}

describe('MatchStore', () => {
  it('a match deleted right after the listing reads as unlisted, not missing', async () => {
    const store = new MatchStore({ dir: mkdtempSync(join(tmpdir(), 'molthar-store-')) });
    await store.connect();
    await store.createMatch('m1', { initialState: {} as any, metadata: metadata() as any });

    // What the lobby route does: list, then fetch each match's metadata
    const listed = await store.listMatches({ gameName: 'portale-von-molthar', where: {} });
    expect(listed).toEqual(['m1']);
    await store.wipe('m1');
    const { metadata: after } = await store.fetch('m1', { metadata: true });

    expect(after?.unlisted).toBe(true);
    // No seats: old credentials must not work on a deleted match
    expect(after?.players).toEqual({});
  });

  it('a match never listed stays missing', async () => {
    const store = new MatchStore({ dir: mkdtempSync(join(tmpdir(), 'molthar-store-')) });
    await store.connect();
    const { metadata } = await store.fetch('nope', { metadata: true });
    expect(metadata).toBeUndefined();
  });
});
