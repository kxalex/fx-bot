import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach, afterEach, expectTypeOf, assertType } from 'vitest';
import { getOrCreate, createChat, Chat, getChat } from '../src/chat';

describe('Chat', () => {
	beforeAll(async () => {
		await createChat(env, 0, 'existing chat', 'private');
	});

	it('creates a new chat if does not exist', async () => {
		const chat = await getOrCreate(env, 123, 'test', 'group');
		expect(chat).toMatchObject({
			id: 123,
			name: 'test',
			type: 'group',
			settings: {
				deleteOriginalPost: false,
			},
		});
	});

	it('returns an existing chat if exists', async () => {
		const chat = await getOrCreate(env, 0, 'another chat', 'oops');
		expect(chat).toMatchObject({
			id: 0,
			name: 'existing chat',
			type: 'private',
			settings: {
				deleteOriginalPost: false,
			},
		});
	});

	it('returns null if chat does not exist', async () => {
		const chat = await getChat(env, 123);
		expect(chat).toBeNull();
	});

	it('returns an existing chat if exists', async () => {
		let chat = await getChat(env, 0);

		expect(chat).not.toBeNull();
		expect(chat).toBeTypeOf('object');
		expect(chat).toMatchObject({
			id: 0,
			name: 'existing chat',
			type: 'private',
			settings: {
				deleteOriginalPost: false,
			},
		});
	});
});
