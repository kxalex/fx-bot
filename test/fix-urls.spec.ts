import { describe, expect, it } from 'vitest';
import { cleanAndFixUrls } from '../src/fix-urls';

describe('9gag, instagram, reddit, twitter, x', () => {

	const urls_to_test: {
		[url: string]: string
	} = {
		'https://9gag.com/gag/avb3v': 'https://fx9gag.kxalex.workers.dev/gag/avb3v',
		'https://9gag.com/gag/avb3v?utm_source=ig&fbclid=123': 'https://fx9gag.kxalex.workers.dev/gag/avb3v',
		'https://9gag.com/gag/avb3v?utm_source=ig&fbclid=123&gclid=123': 'https://fx9gag.kxalex.workers.dev/gag/avb3v',
		'https://instagram.com/reel/C7XX1y9XX9Q/?igsh=amt1eWtjeG9sa3d4': 'https://ddinstagram.com/reel/C7XX1y9XX9Q/',
		'https://www.instagram.com/reel/C7XX1y9XX9Q/?igsh=amt1eWtjeG9sa3d4': 'https://ddinstagram.com/reel/C7XX1y9XX9Q/',
		'https://reddit.com/r/aww/comments/qzr8j6/this_is_why_i_love_my_dog/': 'https://rxddit.com/r/aww/comments/qzr8j6/this_is_why_i_love_my_dog/',
		'https://www.reddit.com/r/aww/comments/qzr8j6/this_is_why_i_love_my_dog/': 'https://rxddit.com/r/aww/comments/qzr8j6/this_is_why_i_love_my_dog/',
		'https://x.com/someUser/status/1793138989769314393': 'https://fixupx.com/someUser/status/1793138989769314393',
		'https://www.x.com/someUser/status/1793138989769314393': 'https://fixupx.com/someUser/status/1793138989769314393',
		'https://twitter.com/someUser/status/1786344385384161474': 'https://fxtwitter.com/someUser/status/1786344385384161474',
		'https://www.twitter.com/someUser/status/1786344385384161474': 'https://fxtwitter.com/someUser/status/1786344385384161474'
	};

	it('should fix 9gag, reddit, instagram, x, twitter urls and removing site tracking', async () => {
		for (const [url, expected] of Object.entries(urls_to_test)) {
			const updated_msg = cleanAndFixUrls(url);
			expect(updated_msg).toBe(expected);
		}
	});

	it('should fix multiple urls and keep the message', async () => {
		const msg = `Test message https://9gag.com/gag/avb3v?utm_source=ig
	9gag with tracking https://9gag.com/gag/avb3v?utm_source=ig
	reddit url https://reddit.com/r/aww/comments/qzr8j6/this_is_why_i_love_my_dog/
	instagram url https://instagram.com/reel/C7XX1y9XX9Q/?igsh=amt1eWtjeG9sa
	x url https://x.com/someUser/status/1793138989769314393`;

		const expected_msg = `Test message https://fx9gag.kxalex.workers.dev/gag/avb3v
	9gag with tracking https://fx9gag.kxalex.workers.dev/gag/avb3v
	reddit url https://rxddit.com/r/aww/comments/qzr8j6/this_is_why_i_love_my_dog/
	instagram url https://ddinstagram.com/reel/C7XX1y9XX9Q/
	x url https://fixupx.com/someUser/status/1793138989769314393`;

		const actual_msg = cleanAndFixUrls(msg);
		expect(actual_msg).toBe(expected_msg);
	});

});
