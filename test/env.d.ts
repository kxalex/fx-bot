declare module 'cloudflare:test' {
	// Controls the type of `import("cloudflare:test").env`
	interface ProvidedEnv extends Env {
		BOT_TOKEN: string;
		KV_CHATS: KVNamespace;
	}
}
