import { describe, expect, it, vi } from 'vitest';
import { InputFile, type Context, type Filter } from 'grammy';
import { findThreadsUrl, replyWithThreadsVideo, resolveThreadsVideo, ThreadsVideo } from '../src/threads-video';

const originalUrl = 'https://www.threads.com/share/BAUc84fMhr/';
const canonicalUrl = 'https://www.threads.net/@andriy_dankovych/post/DctvitNjHP7';
const upstreamVideoUrl = 'https://scontent-syd2-1.cdninstagram.com/video.mp4?token=abc';
const proxyVideoUrl = `https://fixembed.app/video/threads?url=${encodeURIComponent(upstreamVideoUrl)}`;

const createPayload = (overrides: Record<string, unknown> = {}) => ({
	success: true,
	platform: 'threads',
	data: {
		authorHandle: '@andriy_dankovych',
		caption: 'Post text',
		url: canonicalUrl,
		video: { url: proxyVideoUrl },
		...overrides,
	},
});

const createFetch = (payload = createPayload(), status = 200) =>
	vi.fn().mockResolvedValue(
		new Response(JSON.stringify(payload), {
			status,
			headers: { 'Content-Type': 'application/json' },
		}),
	);

describe('findThreadsUrl', () => {
	it('finds and cleans a Threads URL in a message', () => {
		expect(findThreadsUrl(`Watch ${originalUrl}?xmt=abc#media.`)?.toString()).toBe(originalUrl);
	});

	it('rejects non-Threads and lookalike domains', () => {
		expect(findThreadsUrl('https://threads.com.example.com/share/BAUc84fMhr')).toBeUndefined();
		expect(findThreadsUrl('https://example.com/video')).toBeUndefined();
	});
});

describe('resolveThreadsVideo', () => {
	it('returns a trusted native video URL with author, text, and source caption', async () => {
		const fetchFn = createFetch();

		await expect(resolveThreadsVideo(originalUrl, fetchFn)).resolves.toEqual({
			caption: `@andriy_dankovych on Threads\n\nPost text\n\n${canonicalUrl}`,
			sourceUrl: canonicalUrl,
			videoUrl: upstreamVideoUrl,
		});

		expect(fetchFn).toHaveBeenCalledOnce();
		const [requestedUrl, init] = fetchFn.mock.calls[0];
		expect(requestedUrl.toString()).toBe(`https://fixembed.app/api/embed?url=${encodeURIComponent(originalUrl)}`);
		expect(init).toMatchObject({ headers: { Accept: 'application/json' } });
		expect(init.signal).toBeInstanceOf(AbortSignal);
	});

	it('keeps long post text in a separate follow-up message', async () => {
		const longText = 'x'.repeat(1_024);
		const fetchFn = createFetch(createPayload({ caption: longText }));

		const result = await resolveThreadsVideo(originalUrl, fetchFn);

		expect(result?.caption).toBe(`@andriy_dankovych on Threads\n\n${canonicalUrl}`);
		expect(result?.fullText).toBe(`@andriy_dankovych on Threads\n\n${longText}\n\n${canonicalUrl}`);
	});

	it('rejects untrusted media proxy and upstream URLs', async () => {
		const wrongProxy = createFetch(
			createPayload({
				video: { url: `https://evil.example/video/threads?url=${encodeURIComponent(upstreamVideoUrl)}` },
			}),
		);
		const wrongUpstream = createFetch(
			createPayload({
				video: {
					url: `https://fixembed.app/video/threads?url=${encodeURIComponent('https://evil.example/video.mp4')}`,
				},
			}),
		);

		await expect(resolveThreadsVideo(originalUrl, wrongProxy)).resolves.toBeUndefined();
		await expect(resolveThreadsVideo(originalUrl, wrongUpstream)).resolves.toBeUndefined();
	});

	it('falls back when FixEmbed has no video or returns an error', async () => {
		const noVideo = createFetch(createPayload({ video: undefined }));
		const failed = createFetch({ error: 'unavailable' }, 503);

		await expect(resolveThreadsVideo(originalUrl, noVideo)).resolves.toBeUndefined();
		await expect(resolveThreadsVideo(originalUrl, failed)).resolves.toBeUndefined();
	});

	it('does not call FixEmbed for messages without a Threads URL', async () => {
		const fetchFn = createFetch();

		await expect(resolveThreadsVideo('https://example.com/video', fetchFn)).resolves.toBeUndefined();
		expect(fetchFn).not.toHaveBeenCalled();
	});
});

describe('replyWithThreadsVideo', () => {
	const video: ThreadsVideo = {
		caption: 'Caption',
		sourceUrl: canonicalUrl,
		videoUrl: upstreamVideoUrl,
	};

	it('sends a streaming video with its caption above the media', async () => {
		const replyWithVideo = vi.fn().mockResolvedValue({
			message_id: 456,
			video: { duration: 21, file_size: 1_948_341, height: 720, width: 1_280 },
		});
		const reply = vi.fn();
		const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
		const ctx = {
			msg: { message_id: 123, message_thread_id: 789 },
			reply,
			replyWithVideo,
		} as unknown as Filter<Context, 'message'>;

		await expect(replyWithThreadsVideo(ctx, video, true, 42)).resolves.toBe(true);
		const [uploadedVideo, options] = replyWithVideo.mock.calls[0];
		expect(uploadedVideo).toBeInstanceOf(InputFile);
		expect(uploadedVideo.filename).toBe('threads.mp4');
		expect(options).toEqual({
			caption: 'Caption',
			disable_notification: true,
			message_thread_id: 789,
			reply_parameters: { message_id: 123 },
			show_caption_above_media: true,
			supports_streaming: true,
		});
		expect(logSpy).toHaveBeenCalledWith({
			chatId: 42,
			duration: 21,
			event: 'telegram_threads_video_uploaded',
			fileSize: 1_948_341,
			height: 720,
			width: 1_280,
		});
		expect(reply).not.toHaveBeenCalled();
		logSpy.mockRestore();
	});

	it('sends overflow text as a reply to the native video', async () => {
		const replyWithVideo = vi.fn().mockResolvedValue({
			message_id: 456,
			video: { duration: 21, height: 720, width: 1_280 },
		});
		const reply = vi.fn().mockResolvedValue(undefined);
		const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
		const ctx = {
			msg: { message_id: 123 },
			reply,
			replyWithVideo,
		} as unknown as Filter<Context, 'message'>;

		await expect(replyWithThreadsVideo(ctx, { ...video, fullText: 'Full post text' }, false, 42)).resolves.toBe(true);
		expect(reply).toHaveBeenCalledWith('Full post text', {
			disable_notification: true,
			message_thread_id: undefined,
			reply_parameters: { message_id: 456 },
		});
		logSpy.mockRestore();
	});

	it('lets the caller fall back to a fixed link when Telegram rejects the video', async () => {
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const ctx = {
			msg: { message_id: 123 },
			reply: vi.fn(),
			replyWithVideo: vi.fn().mockRejectedValue(new Error('failed to fetch video')),
		} as unknown as Filter<Context, 'message'>;

		await expect(replyWithThreadsVideo(ctx, video, true, 42)).resolves.toBe(false);
		expect(errorSpy).toHaveBeenCalledWith({
			chatId: 42,
			error: 'failed to fetch video',
			event: 'telegram_threads_video_send_failed',
		});
		errorSpy.mockRestore();
	});
});
