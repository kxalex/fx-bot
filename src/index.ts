/**
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { Bot, webhookCallback } from 'grammy';
import { handleBotUpdate, handleNonBotRequest } from './bot';
import { ExecutionContext } from '@cloudflare/workers-types/experimental';

// addEventListener('fetch', webhookCallback(bot, 'cloudflare'));

// noinspection JSUnusedGlobalSymbols
export default {
	async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
		console.log(request.headers.get('x-telegram-bot-api-secret-token'));

		//if (request.headers.get('x-telegram-bot-api-secret-token') === env.BOT_SECRET_TOKEN) {
		const bot = new Bot(env.BOT_TOKEN);
		await handleBotUpdate(bot, env);
		return webhookCallback(bot, 'cloudflare-mod')(request);
		// }

		// return handleNonBotRequest(request, env);
	},
};
