import { describe, expect, it } from 'vitest';
import { fixThreads, isThreads } from '../src/fix-urls';
import { cleanAndFixUrlsTest } from './fix-urls-common';

const sourceUrls = [
	'https://threads.com/@someUser/post/DQ123',
	'https://www.threads.com/@some.user/post/DQ456?xmt=abc',
	'https://threads.net/@someUser/post/DQ789#media',
	'https://www.threads.net/share/DQ012?xmt=abc#media',
];

const toFixEmbed = (sourceUrl: string) => {
	const url = new URL('https://fixembed.app/embed');
	url.searchParams.set('url', sourceUrl);
	return url.toString();
};

const urls = sourceUrls.map((url) => [url, toFixEmbed(url)]);
const validUrls = urls.map((v) => v[0]);
const invalidUrls = [
	...urls.map((v) => v[1]),
	'https://fixthreads.seria.moe/@someUser/post/DQ123',
	'https://fixembed.app/embed?url=https%3A%2F%2Fthreads.com%2F%40someUser%2Fpost%2FDQ123',
	'https://threads.com.example.com/@someUser/post/DQ123',
	'https://threads.net.example.com/@someUser/post/DQ123',
];
const cleanedUrls = sourceUrls.map((sourceUrl) => {
	const cleanedUrl = new URL(sourceUrl);
	cleanedUrl.search = '';
	cleanedUrl.hash = '';
	return [sourceUrl, toFixEmbed(cleanedUrl.toString())];
});

describe('Threads', () => {
	describe('isThreads', () => {
		it.each(validUrls)('should return true for %s', (url) => {
			expect(isThreads(new URL(url))).toBe(true);
		});

		it.each(invalidUrls)('should return false for %s', (url) => {
			expect(isThreads(new URL(url))).toBe(false);
		});
	});

	describe('fixThreads', () => {
		it.each(urls)('should fix url for %s to %s', (url, expectedUrl) => {
			expect(fixThreads(new URL(url))).toEqual(new URL(expectedUrl));
		});

		it.each(invalidUrls)('should not fix url for %s', (url) => {
			expect(fixThreads(new URL(url))).toEqual(new URL(url));
		});
	});

	describe('cleanAndFixUrls', cleanAndFixUrlsTest(cleanedUrls, invalidUrls));
});
