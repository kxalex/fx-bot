import { Features } from './features';

interface Chat {
	id: number;
	name: string | undefined;
	type: string;
	settings: ChatSettings;
	lastUpdatedDate: string;
}

interface ChatSettings {
	deleteOriginalPost?: boolean;
	disabled?: boolean;
	features?: Features;
}

function getChat(env: Env, chatId: number): Promise<Chat | null> {
	return env.KV_CHATS.get<Chat>(chatId.toString(), 'json');
}

async function upsertChat(env: Env, chatId: number, name: string, type: string): Promise<Chat> {
	let chat = await getChat(env, chatId);
	if (chat === null) {
		chat = {
			id: chatId,
			name: name,
			type: type,
			settings: {
				deleteOriginalPost: false,
				disabled: false,
				features: {
					gag: false,
					instagram: true,
					reddit: true,
					x: true,
					tiktok: true,
				},
			},
			lastUpdatedDate: new Date().toISOString(),
		};
	} else {
		chat.name = name;
		chat.type = type;
		chat.lastUpdatedDate = new Date().toISOString();
	}
	await env.KV_CHATS.put(chatId.toString(), JSON.stringify(chat));

	return chat;
}

async function updateChatSettings(env: Env, chatId: number, settings: ChatSettings): Promise<Chat> {
	let chat = await getChat(env, chatId);
	if (chat === null) {
		throw new Error('Chat does not exist');
	}
	chat.settings = settings;
	chat.lastUpdatedDate = new Date().toISOString();
	await env.KV_CHATS.put(chatId.toString(), JSON.stringify(chat));

	return chat;
}

export { getChat, upsertChat, updateChatSettings };
export type { Chat };
