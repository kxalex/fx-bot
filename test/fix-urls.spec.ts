import { describe, expect, it } from 'vitest';
import { cleanAndFixUrls } from '../src/fix-urls';
import { allFeaturesEnabled } from './fix-urls-common';

describe('all in one message', () => {
	it('should fix multiple urls in the message', async () => {
		const msg = `Test message https://9gag.com/gag/avb3v?utm_source=ig
	fx9gag with tracking https://fx9gag.kxalex.workers.dev/gag/avb3v
	9gag with tracking https://9gag.com/gag/avb3v?utm_source=ig
	rxddit url https://rxddit.com/r/aww/comments/qzr8j6/this_is_why_i_love_my_dog/
	reddit url https://reddit.com/r/aww/comments/qzr8j6/this_is_why_i_love_my_dog/
	ddinstagram url https://ddinstagram.com/reel/C7XX1y9XX9Q/?igsh=amt1eWtjeG9sa
	instagram url https://instagram.com/reel/C7XX1y9XX9Q/?igsh=amt1eWtjeG9sa
	fixupx url https://fixupx.com/someUser/status/1793138989769314393
	x url https://x.com/someUser/status/1793138989769314393
	`;

		const expected_msg = `Test message https://fx9gag.kxalex.workers.dev/gag/avb3v
	fx9gag with tracking https://fx9gag.kxalex.workers.dev/gag/avb3v
	9gag with tracking https://fx9gag.kxalex.workers.dev/gag/avb3v
	rxddit url https://rxddit.com/r/aww/comments/qzr8j6/this_is_why_i_love_my_dog/
	reddit url https://rxddit.com/r/aww/comments/qzr8j6/this_is_why_i_love_my_dog/
	ddinstagram url https://ddinstagram.com/reel/C7XX1y9XX9Q/?igsh=amt1eWtjeG9sa
	instagram url https://ddinstagram.com/reel/C7XX1y9XX9Q/
	fixupx url https://fixupx.com/someUser/status/1793138989769314393
	x url https://fixupx.com/someUser/status/1793138989769314393
	`;

		const [updated, actual_msg] = cleanAndFixUrls(msg, allFeaturesEnabled);
		expect(updated).toBe(true);
		expect(actual_msg).toBe(expected_msg);
	});
});

describe('messages with features disabled', () => {
	it('should not rewrite 9gag with the feature disabled', () => {
		const features = { ...allFeaturesEnabled, gag: false };
		const given_msg = `Test message https://9gag.com/gag/avb3v?utm_source=ig`;
		const expected_msg = `Test message https://9gag.com/gag/avb3v?utm_source=ig`;

		const [updated, actual_msg] = cleanAndFixUrls(given_msg, features);
		expect(updated).toBe(false);
		expect(actual_msg).toBe(expected_msg);
	});
});
