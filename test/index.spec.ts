import { SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';

describe('Telegram Bot Worker', () => {
	it('rejects non-webhook requests', async () => {
		const response = await SELF.fetch('https://example.com');

		expect(response.status).toBe(403);
	});
});
