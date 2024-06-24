import { describe, expect, it } from 'vitest';
import { fixReddit, isReddit } from '../src/fix-urls';
import { cleanAndFixUrlsTest } from './fix-urls-common';

// prettier-ignore
const urls = [
	[
		'https://reddit.com/r/shittymoviedetails/comments/160onpq/breaking_actor_from_home_alone_2_arrested_today/jxnkq4g',
		'https://rxddit.com/r/shittymoviedetails/comments/160onpq/breaking_actor_from_home_alone_2_arrested_today/jxnkq4g'
	]
];

const validUrls = urls.map((v) => v[0]);
const invalidUrls = urls.map((v) => v[1]);
const cleanedUrls = urls.map((v) => [v[0], v[1].split('?')[0].split('#')[0]]);

describe('reddit', () => {
	describe('isReddit', () => {
		it.each(validUrls)(`should return true for %s`, (url) => {
			expect(isReddit(new URL(url))).toBe(true);
		});

		it.each(invalidUrls)(`should return false for %s`, (url) => {
			expect(isReddit(new URL(url))).toBe(false);
		});
	});

	describe('fixReddit', () => {
		it.each(urls)(`should fix url for %s to %s`, (url, expectedUrl) => {
			expect(fixReddit(new URL(url))).toEqual(new URL(expectedUrl));
		});

		it.each(invalidUrls)(`should not fix url for %s`, (url) => {
			expect(fixReddit(new URL(url))).toEqual(new URL(url));
		});
	});

	describe('cleanAndFixUrls', cleanAndFixUrlsTest(cleanedUrls, invalidUrls));
});
