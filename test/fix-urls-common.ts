import { expect, it } from 'vitest';
import { cleanAndFixUrls } from '../src/fix-urls';

const allFeaturesEnabled = {
	instagram: true,
	reddit: true,
	tiktok: true,
	x: true,
	gag: true,
};

const cleanAndFixUrlsTest = (cleanedUrls: string[][], invalidUrls: string[]) => () => {
	it.each(cleanedUrls)('should fix url and removing site tracking from %s', (url, expected) => {
		const [updated, updated_msg] = cleanAndFixUrls(url, allFeaturesEnabled);
		expect(updated).toBe(true);
		expect(updated_msg).toBe(expected);
	});

	it.each(invalidUrls)('should not fix url %s', (url) => {
		const [updated, updated_msg] = cleanAndFixUrls(url, allFeaturesEnabled);
		expect(updated).toBe(false);
		expect(updated_msg).toBe(url);
	});
};

export { cleanAndFixUrlsTest, allFeaturesEnabled };
