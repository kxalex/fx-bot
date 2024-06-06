interface Chat {
	id: number;
	name: string | undefined;
	type: string;
	settings: ChatSettings;
	lastUpdatedDate: string;
}

interface ChatSettings {
	deleteOriginalPost: boolean;
}

function getChat(env: Env, chatId: number): Promise<Chat | null> {
	return env.KV_CHATS.get<Chat>(chatId.toString(), 'json');
}

async function createChat(env: Env, chatId: number, name: string, type: string): Promise<Chat> {
	const newChat: Chat = {
		id: chatId,
		name: name,
		type: type,
		settings: {
			deleteOriginalPost: false,
		},
		lastUpdatedDate: new Date().toISOString(),
	};

	await env.KV_CHATS.put(chatId.toString(), JSON.stringify(newChat));

	return newChat;
}

async function getOrCreate(env: Env, chatId: number, name: string, type: string): Promise<Chat> {
	const chat = await getChat(env, chatId);
	if (chat === null) {
		return createChat(env, chatId, name, type);
	}
	return chat;
}

export { getChat, getOrCreate, createChat };
export type { Chat };
