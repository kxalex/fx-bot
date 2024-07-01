import { Bot, CommandContext, Context, Filter } from 'grammy';
import { cleanAndFixUrls } from './fix-urls';
import { upsertChat } from './chat';

async function startCommand(ctx: CommandContext<Context>): Promise<void> {
	await ctx.reply(`*Hi\\!* _Welcome_ to [grammY](https://grammy.dev)\\.`, {
		parse_mode: 'MarkdownV2',
	});
}

async function onNewChatMembersMe(ctx: Context): Promise<void> {
	await ctx.reply('Hello, world!');
}

async function onMessageUrl(ctx: Filter<Context, 'message'>, env: Env) {
	if (ctx.msg.text) {
		console.log('Received message: ', ctx.msg.text);
		try {
			const chatId = ctx.msg.chat.id || ctx.msg.from.id;
			const chat = await upsertChat(env, chatId, ctx.msg.chat.title ?? ctx.msg.from.first_name, ctx.msg.chat.type);
			if (chat.settings.disabled) {
				console.log('Chat is disabled: %s', chatId);
				return;
			}

			const [updated, updated_msg] = cleanAndFixUrls(ctx.msg.text, chat.settings.features);
			console.log('Updated message: ', updated_msg);
			if (updated) {
				const msg = `${updated_msg}`;

				if (chat.settings.deleteOriginalPost) {
					try {
						await ctx.deleteMessage();
					} catch (err) {
						console.error('Error deleting message: %s', err);
					}

					await ctx.reply(msg, {
						message_thread_id: ctx.msg.message_thread_id,
						disable_notification: true,
					});
				} else {
					await ctx.reply(msg, {
						reply_to_message_id: ctx.msg.message_id,
						message_thread_id: ctx.msg.message_thread_id,
						disable_notification: true,
					});
				}
			}
		} catch (err) {
			console.error('Error cleaning URL: ', ctx.msg.text, err);
		}
	}
}

export async function handleBotUpdate(bot: Bot, env: Env): Promise<void> {
	bot.command('start', startCommand);
	bot.on(':new_chat_members:me', onNewChatMembersMe);
	bot.on('message::url', (ctx) => onMessageUrl(ctx, env));
}

export async function handleNonBotRequest(_req: Request, _env: Env): Promise<Response> {
	// Request not having the correct secret token is handled here
	return new Response(null, { status: 403 });
}
