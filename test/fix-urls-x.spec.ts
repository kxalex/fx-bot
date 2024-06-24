import { describe, expect, it } from 'vitest';
import { fixX, isX } from '../src/fix-urls';
import { cleanAndFixUrlsTest } from './fix-urls-common';

// prettier-ignore
const urls = [
	[
		'https://twitter.com/',
		'https://fxtwitter.com/'
	],
	[
		'https://twitter.com/RudijLis',
		'https://fxtwitter.com/RudijLis'
	],
	[
		'https://twitter.com/RudijLis/status/1804909257025871876',
		'https://fxtwitter.com/RudijLis/status/1804909257025871876',
	],
	[
		'https://twitter.com?utm_source=ig&fbclid=123',
		'https://fxtwitter.com/?utm_source=ig&fbclid=123'
	],
	[
		'https://twitter.com/RudijLis?utm_source=ig&fbclid=123&gclid=123',
		'https://fxtwitter.com/RudijLis?utm_source=ig&fbclid=123&gclid=123',
	],
	[
		'https://twitter.com/RudijLis/status/1804909257025871876?utm_source=ig&fbclid=123&gclid=123',
		'https://fxtwitter.com/RudijLis/status/1804909257025871876?utm_source=ig&fbclid=123&gclid=123',
	],
	[
		'https://www.twitter.com/',
		'https://www.fxtwitter.com/'
	],
	[
		'https://www.twitter.com/RudijLis',
		'https://www.fxtwitter.com/RudijLis'
	],
	[
		'https://www.twitter.com/RudijLis/status/1804909257025871876',
		'https://www.fxtwitter.com/RudijLis/status/1804909257025871876',
	],
	[
		'https://www.twitter.com?utm_source=ig&fbclid=123',
		'https://www.fxtwitter.com/?utm_source=ig&fbclid=123'
	],
	[
		'https://www.twitter.com/RudijLis?utm_source=ig&fbclid=123&gclid=123',
		'https://www.fxtwitter.com/RudijLis?utm_source=ig&fbclid=123&gclid=123',
	],
	[
		'https://www.twitter.com/RudijLis/status/1804909257025871876?utm_source=ig&fbclid=123&gclid=123',
		'https://www.fxtwitter.com/RudijLis/status/1804909257025871876?utm_source=ig&fbclid=123&gclid=123',
	],
	[
		'https://x.com/',
		'https://fixupx.com/'
	],
	[
		'https://x.com/RudijLis',
		'https://fixupx.com/RudijLis'
	],
	[
		'https://x.com/RudijLis/status/1804909257025871876',
		'https://fixupx.com/RudijLis/status/1804909257025871876'
	],
	[
		'https://x.com?utm_source=ig&fbclid=123',
		'https://fixupx.com/?utm_source=ig&fbclid=123'
	],
	[
		'https://x.com/RudijLis?utm_source=ig&fbclid=123&gclid=123',
		'https://fixupx.com/RudijLis?utm_source=ig&fbclid=123&gclid=123',
	],
	[
		'https://x.com/RudijLis/status/1804909257025871876?utm_source=ig&fbclid=123&gclid=123',
		'https://fixupx.com/RudijLis/status/1804909257025871876?utm_source=ig&fbclid=123&gclid=123',
	],
	[
		'https://www.x.com/',
		'https://www.fixupx.com/'
	],
	[
		'https://www.x.com/RudijLis',
		'https://www.fixupx.com/RudijLis'
	],
	[
		'https://www.x.com/RudijLis/status/1804909257025871876',
		'https://www.fixupx.com/RudijLis/status/1804909257025871876',
	],
	[
		'https://www.x.com?utm_source=ig&fbclid=123',
		'https://www.fixupx.com/?utm_source=ig&fbclid=123'
	],
	[
		'https://www.x.com/RudijLis?utm_source=ig&fbclid=123&gclid=123',
		'https://www.fixupx.com/RudijLis?utm_source=ig&fbclid=123&gclid=123',
	],
	[
		'https://www.x.com/RudijLis/status/1804909257025871876?utm_source=ig&fbclid=123&gclid=123',
		'https://www.fixupx.com/RudijLis/status/1804909257025871876?utm_source=ig&fbclid=123&gclid=123',
	],
];

const validUrls = urls.map((v) => v[0]);
const invalidUrls = urls.map((v) => v[1]);
const cleanedUrls = urls.map((v) => [v[0], v[1].split('?')[0].split('#')[0]]);

describe('X, Twitter', () => {
	describe('isX', () => {
		it.each(validUrls)(`should return true for %s`, (url) => {
			expect(isX(new URL(url))).toBe(true);
		});

		it.each(invalidUrls)(`should return false for %s`, (url) => {
			expect(isX(new URL(url))).toBe(false);
		});
	});

	describe('fixX', () => {
		it.each(urls)(`should fix url for %s to %s`, (url, expectedUrl) => {
			expect(fixX(new URL(url))).toEqual(new URL(expectedUrl));
		});

		it.each(invalidUrls)(`should not fix url for %s`, (url) => {
			expect(fixX(new URL(url))).toEqual(new URL(url));
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
// describe('twitter, x', () => {
// 	it.each([
// 		['https://x.com/someUser/status/1793138989769314393', 'https://fixupx.com/someUser/status/1793138989769314393'],
// 		['https://www.x.com/someUser/status/1793138989769314393', 'https://fixupx.com/someUser/status/1793138989769314393'],
// 		['https://twitter.com/someUser/status/1786344385384161474', 'https://fxtwitter.com/someUser/status/1786344385384161474'],
// 		['https://www.twitter.com/someUser/status/1786344385384161474', 'https://fxtwitter.com/someUser/status/1786344385384161474'],
// 	])('should fix url and removing site tracking from %s', (url, expected) => {
// 		const [updated, updated_msg] = cleanAndFixUrls(url);
// 		expect(updated).toBe(true);
// 		expect(updated_msg).toBe(expected);
// 	});
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
// 	9gag with tracking https://fx9gag.kxalex.workers.dev/gag/avb3v
// 	reddit url https://rxddit.com/r/aww/comments/qzr8j6/this_is_why_i_love_my_dog/
// 	instagram url https://ddinstagram.com/reel/C7XX1y9XX9Q/
// 	x url https://fixupx.com/someUser/status/1793138989769314393`;
//
// 		const [updated, actual_msg] = cleanAndFixUrls(msg);
// 		expect(updated).toBe(true);
// 		expect(actual_msg).toBe(expected_msg);
// 	});
// });
