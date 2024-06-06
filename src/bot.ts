import { Bot } from 'grammy';
import { cleanAndFixUrls } from './fix-urls';

export async function handleBotUpdate(bot: Bot, env: Env): Promise<void> {
	// The following line of code assumes that you have configured the secrets BOT_TOKEN and BOT_INFO.
	// See https://developers.cloudflare.com/workers/platform/environment-variables/#secrets-on-deployed-workers.
	// The BOT_INFO is obtained from `bot.api.getMe()`.
	// 	const bot = new Bot(BOT_TOKEN, {});

	bot.command('start', async (ctx) => {
		await ctx.reply('Hello, world!');
	});

	bot.on(':new_chat_members:me', async (ctx) => {
		await ctx.reply('Hello, world!');
	});

	bot.on('message::url', async (ctx) => {
		if (ctx.msg.text) {
			console.log('Received message: ', ctx.msg.text);
			try {
				const [updated, updated_msg] = cleanAndFixUrls(ctx.msg.text);
				if (updated) {
					const chatId = ctx.msg.chat.id || ctx.msg.from.id;
					if (chatId === -1002018620826) {
						try {
							await ctx.deleteMessage();
						} catch (err) {
							console.error('Error deleting message: %s', err);
						}

						await ctx.reply(`${updated_msg} (${ctx.msg.from.first_name})`, {
							message_thread_id: ctx.msg.message_thread_id,
							disable_notification: true,
						});
					} else {
						await ctx.reply(`${updated_msg} (${ctx.msg.from.first_name})`, {
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
	});
}

export async function handleNonBotRequest(_req: Request, _env: Env): Promise<Response> {
	// Request not having the correct secret token is handled here
	return new Response(null, { status: 403 });
}
