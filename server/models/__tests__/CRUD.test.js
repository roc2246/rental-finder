import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import * as CRUD from '../CRUD.js';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, { dbName: 'test' });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

beforeEach(async () => {
  const { collections } = mongoose.connection;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('CRUD functions', () => {
  it('addRental creates and prevents duplicates', async () => {
    const listing = { title: 'A', listingURL: 'http://a', city: 'X', dailyRate: 100 };
    const created = await CRUD.addRental(listing);
    expect(created).toBeTruthy();
    expect(created.listingURL).toBe(listing.listingURL);

    const duplicate = await CRUD.addRental(listing);
    expect(duplicate).toBeNull();
  });

  it('updateRental updates fields and does not allow listingURL change', async () => {
    const listing = { title: 'B', listingURL: 'http://b', city: 'Y', dailyRate: 200 };
    await CRUD.addRental(listing);

    const updated = await CRUD.updateRental(listing.listingURL, { city: 'Z', listingURL: 'http://evil' });
    expect(updated).toBeTruthy();
    expect(updated.city).toBe('Z');
    expect(updated.listingURL).toBe(listing.listingURL);
  });

  it('getRentals paginates and excludes soft-deleted by default', async () => {
    const items = [];
    for (let i = 0; i < 5; i++) items.push({ title: `L${i}`, listingURL: `u${i}`, dailyRate: i * 10, city: 'C' });
    await Promise.all(items.map(i => CRUD.addRental(i)));

    // soft delete one
    await CRUD.deleteRental('u2');

    const page = await CRUD.getRentals({}, { skip: 0, limit: 10 });
    expect(page.total).toBe(4);
    expect(page.results.find(r => r.listingURL === 'u2')).toBeUndefined();

    // include deleted by explicitly querying for deleted true
    const includeDeleted = await CRUD.getRentals({ deleted: true }, { skip: 0, limit: 10 });
    expect(includeDeleted.total).toBe(1);
  });

  it('deleteRental hard delete when requested', async () => {
    const listing = { title: 'Hard', listingURL: 'hard', dailyRate: 300 };
    await CRUD.addRental(listing);
    const hard = await CRUD.deleteRental('hard', { soft: false });
    expect(hard).toBeTruthy();

    const found = await CRUD.getRentals({ listingURL: 'hard' }, { skip: 0, limit: 10 });
    expect(found.total).toBe(0);
  });
});
