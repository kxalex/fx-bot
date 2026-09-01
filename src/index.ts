/**
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { Bot, webhookCallback } from 'grammy';
import { handleBotUpdate, handleNonBotRequest } from './bot';

// noinspection JSUnusedGlobalSymbols
export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (request.method !== 'POST') {
			return handleNonBotRequest(request, env);
		}

		const bot = new Bot(env.BOT_TOKEN);
		handleBotUpdate(bot, env);
		return webhookCallback(bot, 'cloudflare-mod')(request);
	},
} satisfies ExportedHandler<Env>;
