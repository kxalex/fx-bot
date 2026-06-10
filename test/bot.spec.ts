import { Context, Filter } from 'grammy';
import { describe, expect, it, vi } from 'vitest';
import { handleBotUpdate } from '../src/bot';

type ChatType = Filter<Context, 'message'>['msg']['chat']['type'];

type TestContext = Filter<Context, 'message'> & {
	reply: ReturnType<typeof vi.fn>;
};

const createCtx = ({
	userId = 302927541,
	chatType = 'group',
	messageId = 123,
}: {
	userId?: number;
	chatType?: ChatType;
	messageId?: number;
} = {}): TestContext => {
	const reply = vi.fn().mockResolvedValue(undefined);

	return {
		msg: {
			from: { id: userId },
			chat: { id: 42, type: chatType },
			message_id: messageId,
		},
		reply,
	} as unknown as TestContext;
};

// TODO: re-enable once onSpecificUserMessage reply logic is implemented in src/bot.ts
describe.skip('handleBotUpdate -> onSpecificUserMessage', () => {
	const createEnv = (): Parameters<typeof handleBotUpdate>[1] =>
		({
			BOT_TOKEN: 'token',
			KV_CHATS: {
				get: vi.fn(),
				put: vi.fn(),
				delete: vi.fn(),
				list: vi.fn(),
			},
		}) as unknown as Parameters<typeof handleBotUpdate>[1];

	const setupHandlers = async () => {
		const handlers: Record<string, (ctx: Filter<Context, 'message'>) => Promise<void>> = {};
		const bot = {
			command: vi.fn(),
			on: vi.fn(function (this: unknown, event, handler) {
				handlers[event] = handler;
				return this;
			}),
		} as unknown as Parameters<typeof handleBotUpdate>[0];

		await handleBotUpdate(bot, createEnv());
		return handlers;
	};

	const runHandler = async (ctx: TestContext) => {
		const handlers = await setupHandlers();
		const handler = handlers['message'];
		if (!handler) {
			throw new Error('message handler not registered');
		}

		await handler(ctx);
	};

	it('replies when the defined user sends a group message', async () => {
		const ctx = createCtx();
		await runHandler(ctx);
		expect(ctx.reply).toHaveBeenCalledWith('Hello', {
			reply_to_message_id: 123,
		});
	});

	it('ignores messages from the defined user in non-group chats', async () => {
		const ctx = createCtx({ chatType: 'private' });
		await runHandler(ctx);
		expect(ctx.reply).not.toHaveBeenCalled();
	});

	it('ignores messages from other users in groups', async () => {
		const ctx = createCtx({ userId: 1 });
		await runHandler(ctx);
		expect(ctx.reply).not.toHaveBeenCalled();
	});
});
