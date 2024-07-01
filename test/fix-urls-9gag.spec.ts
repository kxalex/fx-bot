import { describe, expect, it } from 'vitest';
import { fix9gag, is9gag } from '../src/fix-urls';
import { cleanAndFixUrlsTest } from './fix-urls-common';

// prettier-ignore
const urls = [
	[
		'https://9gag.com/gag/avb3v',
		'https://fx9gag.com/gag/avb3v'
	],
	[
		'https://9gag.com/gag/avb3v?utm_source=ig&fbclid=123',
		'https://fx9gag.com/gag/avb3v?utm_source=ig&fbclid=123'
	],
	[
		'https://9gag.com/gag/avb3v?utm_source=ig&fbclid=123&gclid=123',
		'https://fx9gag.com/gag/avb3v?utm_source=ig&fbclid=123&gclid=123',
	],
	[
 		'https://www.9gag.com/gag/avb3v',
		'https://fx9gag.com/gag/avb3v'
	],
	[
		'https://www.9gag.com/gag/avb3v?utm_source=ig&fbclid=123',
		'https://fx9gag.com/gag/avb3v?utm_source=ig&fbclid=123'
	],
	[
		'https://www.9gag.com/gag/avb3v?utm_source=ig&fbclid=123&gclid=123',
		'https://fx9gag.com/gag/avb3v?utm_source=ig&fbclid=123&gclid=123',
	],
];

const validUrls = urls.map((v) => v[0]);
const invalidUrls = urls.map((v) => v[1]);
const cleanedUrls = urls.map((v) => [v[0], v[1].split('?')[0].split('#')[0]]);

describe('9gag', () => {
	describe('is9gag', () => {
		it.each(validUrls)(`should return true for %s`, (url) => {
			expect(is9gag(new URL(url))).toBe(true);
		});

		it.each(invalidUrls)(`should return false for %s`, (url) => {
			expect(is9gag(new URL(url))).toBe(false);
		});
	});

	describe('fix9gag', () => {
		it.each(urls)(`should fix url for %s to %s`, (givenUrl, expectedUrl) => {
			expect(fix9gag(new URL(givenUrl))).toEqual(new URL(expectedUrl));
		});

		it.each(
			invalidUrls.concat(
				['https://fx9gag.com'],
				['https://fx9gag.com/gag'],
				['https://fx9gag.com/gag/'],
				['https://fx9gag.com/?utm_source=ig&fbclid=123'],
				['https://fx9gag.com/gag/?utm_source=ig&fbclid=123&gclid=123'],
				['https://www.fx9gag.com'],
				['https://www.fx9gag.com/gag'],
				['https://www.fx9gag.com/gag/'],
				['https://www.fx9gag.com/?utm_source=ig&fbclid=123&gclid=123'],
				['https://www.fx9gag.com/gag?utm_source=ig&fbclid=123&gclid=123'],
				['https://www.fx9gag.com/gag/?utm_source=ig&fbclid=123&gclid=123'],
			),
		)(`should not fix url for %s`, (url) => {
			expect(fix9gag(new URL(url))).toEqual(new URL(url));
		});
	});

	describe('cleanAndFixUrls', cleanAndFixUrlsTest(cleanedUrls, invalidUrls));
});

//
// describe('reddit', () => {
// 	it.each([
// 		[
// 			'https://reddit.com/r/aww/comments/qzr8j6/this_is_why_i_love_my_dog/',
// 			'https://rxddit.com/r/aww/comments/qzr8j6/this_is_why_i_love_my_dog/',
// 		],
// 		[
// 			'https://www.reddit.com/r/aww/comments/qzr8j6/this_is_why_i_love_my_dog/',
// 			'https://rxddit.com/r/aww/comments/qzr8j6/this_is_why_i_love_my_dog/',
// 		],
// 	])('should fix url and removing site tracking from %s', (url, expected) => {
// 		const [updated, updated_msg] = cleanAndFixUrls(url);
// 		expect(updated).toBe(true);
// 		expect(updated_msg).toBe(expected);
// 	});
//
// 	it.each([
// 		[
// 			'https://rxddit.com/r/aww/comments/qzr8j6/this_is_why_i_love_my_dog/',
// 			'https://rxddit.com/r/aww/comments/qzr8j6/this_is_why_i_love_my_dog/',
// 		],
// 	])('should not fix url %s', (url, expected) => {
// 		const [updated, updated_msg] = cleanAndFixUrls(url);
// 		expect(updated).toBe(false);
// 		expect(updated_msg).toBe(expected);
// 	});
// });
//
//
// 	it.each([
// 		['https://fixupx.com/someUser/status/1793138989769314393', 'https://fixupx.com/someUser/status/1793138989769314393'],
// 		['https://fxtwitter.com/someUser/status/1786344385384161474', 'https://fxtwitter.com/someUser/status/1786344385384161474'],
// 	])('should not fix url %s', (url, expected) => {
// 		const [updated, updated_msg] = cleanAndFixUrls(url);
// 		expect(updated).toBe(false);
// 		expect(updated_msg).toBe(expected);
// 	});
// });
//
// describe('all in one message', () => {
// 	it('should fix multiple urls in the message', async () => {
// 		const msg = `Test message https://9gag.com/gag/avb3v?utm_source=ig
// 	9gag with tracking https://9gag.com/gag/avb3v?utm_source=ig
// 	reddit url https://reddit.com/r/aww/comments/qzr8j6/this_is_why_i_love_my_dog/
// 	instagram url https://instagram.com/reel/C7XX1y9XX9Q/?igsh=amt1eWtjeG9sa
// 	x url https://x.com/someUser/status/1793138989769314393`;
//
// 		const expected_msg = `Test message https://9gag.com/gag/avb3v
// 	9gag with tracking https://fx9gag.com/gag/avb3v
// 	reddit url https://rxddit.com/r/aww/comments/qzr8j6/this_is_why_i_love_my_dog/
// 	instagram url https://ddinstagram.com/reel/C7XX1y9XX9Q/
// 	x url https://fixupx.com/someUser/status/1793138989769314393`;
//
// 		const [updated, actual_msg] = cleanAndFixUrls(msg);
// 		expect(updated).toBe(true);
// 		expect(actual_msg).toBe(expected_msg);
// 	});
// });
