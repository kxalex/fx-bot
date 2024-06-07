import { env } from 'cloudflare:test';
import { describe, it, expect, beforeAll } from 'vitest';
import { upsertChat, getChat, updateChatSettings } from '../src/Chat';

describe('Chat', () => {
	beforeAll(async () => {
		await upsertChat(env, 0, 'existing chat', 'private');
	});

	it('creates a new chat if does not exist', async () => {
		const chat = await upsertChat(env, 123, 'test', 'group');
		expect(chat).toMatchObject({
			id: 123,
			name: 'test',
			type: 'group',
			settings: {
				deleteOriginalPost: false,
			},
		});
	});

	it('update an existing chat if exists', async () => {
		const chat = await upsertChat(env, 0, 'another name', 'oops');
		expect(chat).toMatchObject({
			id: 0,
			name: 'another name',
			type: 'oops',
			settings: {
				deleteOriginalPost: false,
			},
		});
	});

	it('update chat settings if chat exists', async () => {
		const chat = await updateChatSettings(env, 0, { deleteOriginalPost: true });
		expect(chat).toMatchObject({
			id: 0,
			name: 'existing chat',
			type: 'private',
			settings: {
				deleteOriginalPost: true,
			},
		});
	});

	it("throw an error on update if chat doesn't exist", async () => {
		expect(updateChatSettings(env, 123, { deleteOriginalPost: true })).rejects.toThrow('Chat does not exist');
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
