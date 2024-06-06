import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach, afterEach, expectTypeOf } from 'vitest';
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
		const chat = await getChat(env, 0);

		expect(chat).not.toBeNull();
		expectTypeOf(chat).toEqualTypeOf<Chat | null>({
			id: 0,
			name: 'existing chat',
			type: 'private',
			settings: {
				deleteOriginalPost: false,
			},
			lastUpdatedDate: 'string',
		});

		expect(chat.id).toBe(0);
		expect(chat.name).toBe('existing chat');
		expect(chat.type).toBe('private');
		expect(chat.settings.deleteOriginalPost).toBe(false);
		expect(chat.lastUpdatedDate).toBeTypeOf('string');
	});
});
