import { Bot, CommandContext, Context, Filter, NextFunction } from 'grammy';
import { cleanAndFixUrls } from './fix-urls';
import { upsertChat } from './chat';
import { defaultFeatures } from './features';
import { replyWithThreadsVideo, resolveThreadsVideo } from './threads-video';

async function startCommand(ctx: CommandContext<Context>): Promise<void> {
	await ctx.reply(`*Hi\\!* _Welcome_ to [grammY](https://grammy.dev)\\.`, {
		parse_mode: 'MarkdownV2',
	});
}

async function onNewChatMembersMe(ctx: Context): Promise<void> {
	await ctx.reply('Hello, world!');
}

async function onSpecificUserMessage(ctx: Filter<Context, 'message'>, next: NextFunction): Promise<void> {
	const userId = ctx.msg.from?.id;
	const chatType = ctx.msg.chat.type;

	/*
	if (userId === 302927541 && (chatType === 'group' || chatType === 'supergroup')) {
		await ctx.reply('test', {
			reply_to_message_id: ctx.msg.message_id,
		});
	}*/

	await next();
}

async function onMessageUrl(ctx: Filter<Context, 'message'>, env: Env) {
	if (ctx.msg.text) {
		const chatId = ctx.msg.chat.id || ctx.msg.from.id;
		console.log({ event: 'telegram_message_received', chatId, messageId: ctx.msg.message_id });
		try {
			const chat = await upsertChat(env, chatId, ctx.msg.chat.title ?? ctx.msg.from.first_name, ctx.msg.chat.type);
			if (chat.settings.disabled) {
				console.log({ event: 'telegram_chat_disabled', chatId });
				return;
			}

			const features = { ...defaultFeatures, ...chat.settings.features };
			const [updated, updated_msg] = cleanAndFixUrls(ctx.msg.text, features);
			if (updated) {
				console.log({ event: 'telegram_urls_rewritten', chatId, messageId: ctx.msg.message_id });
				const msg = `${updated_msg}`;
				const threadsVideo = features.threads ? await resolveThreadsVideo(ctx.msg.text) : undefined;

				if (chat.settings.deleteOriginalPost) {
					try {
						await ctx.deleteMessage();
					} catch (err) {
						console.error({
							event: 'telegram_message_delete_failed',
							chatId,
							error: err instanceof Error ? err.message : String(err),
						});
					}
				}

				if (
					threadsVideo &&
					(await replyWithThreadsVideo(ctx, threadsVideo, !chat.settings.deleteOriginalPost, chatId))
				) {
					console.log({ event: 'telegram_threads_video_sent', chatId, messageId: ctx.msg.message_id });
					return;
				}

				await ctx.reply(msg, {
					...(chat.settings.deleteOriginalPost ? {} : { reply_parameters: { message_id: ctx.msg.message_id } }),
					message_thread_id: ctx.msg.message_thread_id,
					disable_notification: true,
				});
			}
		} catch (err) {
			console.error({
				event: 'telegram_url_handler_failed',
				chatId,
				error: err instanceof Error ? err.message : String(err),
			});
		}
	}
}

export function handleBotUpdate(bot: Bot, env: Env): void {
	bot.command('start', startCommand);
	bot.on(':new_chat_members:me', onNewChatMembersMe);
	bot.on('message', onSpecificUserMessage);
	bot.on('message::url', (ctx) => onMessageUrl(ctx, env));
}

export async function handleNonBotRequest(_req: Request, _env: Env): Promise<Response> {
	// Request not having the correct secret token is handled here
	return new Response(null, { status: 403 });
}
