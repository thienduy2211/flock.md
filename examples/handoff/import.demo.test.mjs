import test from 'node:test';
import assert from 'node:assert/strict';
import { importRows } from './src/import.mjs';

test('B1 normalizes row fields', () => {
  assert.deepEqual(importRows([{ id: ' 1 ', title: ' Shirt ' }]), [{ id: '1', title: 'Shirt' }]);
});

test('B2 rejects duplicate IDs (intentionally failing checkpoint)', () => {
  assert.throws(() => importRows([{ id: '1', title: 'A' }, { id: '1', title: 'B' }]), /duplicate/i);
});
