import { InputFile, type Context, type Filter } from 'grammy';
import { isThreads } from './fix-urls';

const FIXEMBED_API_URL = 'https://fixembed.app/api/embed';
const FIXEMBED_HOST = 'fixembed.app';
const FIXEMBED_THREADS_VIDEO_PATH = '/video/threads';
const FIXEMBED_TIMEOUT_MS = 7_000;
const TELEGRAM_VIDEO_CAPTION_LIMIT = 1_024;
const URL_REGEX = /https?:\/\/[^\s<]+/gi;
const TRAILING_URL_PUNCTUATION = /[),.!?;:'"\]]+$/;

type FetchFunction = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

interface FixEmbedResponse {
	success?: boolean;
	platform?: string;
	data?: {
		authorHandle?: unknown;
		authorName?: unknown;
		caption?: unknown;
		title?: unknown;
		url?: unknown;
		video?: {
			url?: unknown;
		};
	};
}

interface ThreadsVideo {
	caption: string;
	fullText?: string;
	sourceUrl: string;
	videoUrl: string;
}

function nonEmptyString(value: unknown): string | undefined {
	return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function isTrustedThreadsUrl(url: URL): boolean {
	return url.protocol === 'https:' && !url.username && !url.password && !url.port && isThreads(url);
}

function findThreadsUrl(message: string): URL | undefined {
	for (const match of message.matchAll(URL_REGEX)) {
		const rawUrl = match[0].replace(TRAILING_URL_PUNCTUATION, '');
		try {
			const url = new URL(rawUrl);
			if (isTrustedThreadsUrl(url)) {
				url.search = '';
				url.hash = '';
				return url;
			}
		} catch {
			// Ignore malformed URLs and preserve the normal URL-rewrite fallback.
		}
	}

	return undefined;
}

function isTrustedMediaHost(hostname: string): boolean {
	return (
		hostname === 'cdninstagram.com' ||
		hostname.endsWith('.cdninstagram.com') ||
		hostname === 'fbcdn.net' ||
		hostname.endsWith('.fbcdn.net')
	);
}

function trustedVideoUrl(value: unknown): string | undefined {
	const rawUrl = nonEmptyString(value);
	if (!rawUrl) return undefined;

	try {
		const proxyUrl = new URL(rawUrl);
		if (
			proxyUrl.protocol !== 'https:' ||
			proxyUrl.hostname !== FIXEMBED_HOST ||
			proxyUrl.pathname !== FIXEMBED_THREADS_VIDEO_PATH ||
			proxyUrl.username ||
			proxyUrl.password ||
			proxyUrl.port
		) {
			return undefined;
		}

		const upstreamValue = proxyUrl.searchParams.get('url');
		if (!upstreamValue) return undefined;

		const upstreamUrl = new URL(upstreamValue);
		if (
			upstreamUrl.protocol !== 'https:' ||
			upstreamUrl.username ||
			upstreamUrl.password ||
			upstreamUrl.port ||
			!isTrustedMediaHost(upstreamUrl.hostname.toLowerCase())
		) {
			return undefined;
		}

		// FixEmbed's relay advertises byte ranges but currently answers range requests
		// with the entire file. Give Telegram the validated signed CDN URL instead.
		return upstreamUrl.toString();
	} catch {
		return undefined;
	}
}

function canonicalThreadsUrl(value: unknown, fallback: URL): string {
	const rawUrl = nonEmptyString(value);
	if (!rawUrl) return fallback.toString();

	try {
		const url = new URL(rawUrl);
		return isTrustedThreadsUrl(url) ? url.toString() : fallback.toString();
	} catch {
		return fallback.toString();
	}
}

function formatAuthor(handle: unknown, name: unknown): string {
	const authorHandle = nonEmptyString(handle);
	if (authorHandle) return authorHandle.startsWith('@') ? authorHandle : `@${authorHandle}`;

	const authorName = nonEmptyString(name);
	if (authorName) return authorName.startsWith('@') ? authorName : `@${authorName}`;

	return 'Threads';
}

function buildCaption(
	data: NonNullable<FixEmbedResponse['data']>,
	sourceUrl: string,
): Pick<ThreadsVideo, 'caption' | 'fullText'> {
	const author = formatAuthor(data.authorHandle, data.authorName);
	const authorLine = author === 'Threads' ? author : `${author} on Threads`;
	const postText = nonEmptyString(data.caption) ?? nonEmptyString(data.title);
	const fullText = [authorLine, postText, sourceUrl].filter(Boolean).join('\n\n');

	if (fullText.length <= TELEGRAM_VIDEO_CAPTION_LIMIT) {
		return { caption: fullText };
	}

	return {
		caption: `${authorLine}\n\n${sourceUrl}`,
		fullText,
	};
}

async function resolveThreadsVideo(message: string, fetchFn: FetchFunction = fetch): Promise<ThreadsVideo | undefined> {
	const threadsUrl = findThreadsUrl(message);
	if (!threadsUrl) return undefined;

	const apiUrl = new URL(FIXEMBED_API_URL);
	apiUrl.searchParams.set('url', threadsUrl.toString());

	let response: Response;
	try {
		response = await fetchFn(apiUrl, {
			headers: { Accept: 'application/json' },
			signal: AbortSignal.timeout(FIXEMBED_TIMEOUT_MS),
		});
	} catch {
		return undefined;
	}

	if (!response.ok) return undefined;

	let payload: FixEmbedResponse;
	try {
		payload = (await response.json()) as FixEmbedResponse;
	} catch {
		return undefined;
	}

	if (!payload.success || payload.platform !== 'threads' || !payload.data) return undefined;

	const videoUrl = trustedVideoUrl(payload.data.video?.url);
	if (!videoUrl) return undefined;

	const sourceUrl = canonicalThreadsUrl(payload.data.url, threadsUrl);
	return {
		...buildCaption(payload.data, sourceUrl),
		sourceUrl,
		videoUrl,
	};
}

async function replyWithThreadsVideo(
	ctx: Filter<Context, 'message'>,
	video: ThreadsVideo,
	replyToOriginal: boolean,
	chatId: number,
): Promise<boolean> {
	let videoMessage;
	try {
		videoMessage = await ctx.replyWithVideo(new InputFile({ url: video.videoUrl }, 'threads.mp4'), {
			caption: video.caption,
			show_caption_above_media: true,
			supports_streaming: true,
			message_thread_id: ctx.msg.message_thread_id,
			disable_notification: true,
			...(replyToOriginal ? { reply_parameters: { message_id: ctx.msg.message_id } } : {}),
		});
	} catch (err) {
		console.error({
			event: 'telegram_threads_video_send_failed',
			chatId,
			error: err instanceof Error ? err.message : String(err),
		});
		return false;
	}

	console.log({
		event: 'telegram_threads_video_uploaded',
		chatId,
		duration: videoMessage.video.duration,
		fileSize: videoMessage.video.file_size,
		height: videoMessage.video.height,
		width: videoMessage.video.width,
	});

	if (video.fullText) {
		try {
			await ctx.reply(video.fullText, {
				reply_parameters: { message_id: videoMessage.message_id },
				message_thread_id: ctx.msg.message_thread_id,
				disable_notification: true,
			});
		} catch (err) {
			console.error({
				event: 'telegram_threads_text_send_failed',
				chatId,
				error: err instanceof Error ? err.message : String(err),
			});
		}
	}

	return true;
}

export { findThreadsUrl, replyWithThreadsVideo, resolveThreadsVideo };
export type { FetchFunction, ThreadsVideo };
