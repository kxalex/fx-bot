export interface Chat {
	id: number;
	name: string | undefined;
	type: string;
	settings: ChatSettings;
}

export interface ChatSettings {
	deleteOriginalPost: boolean;
}

export async function getChat(chatId: string): Promise<Chat> {
	const chat = await KV_CHATS.get<Chat>(chatId);
	if (chat === null) {
		console.log(`Chat ${chatId} not found using default settings.`);
		return {
			id: parseInt(chatId),
			name: undefined,
			type: 'private',
			settings: {
				deleteOriginalPost: false,
			},
		};
	}
	return chat;
}

export function createChat(chat: Chat): Promise<void> {
	return KV_CHATS.put(chat.id.toString(), JSON.stringify(chat));
}
