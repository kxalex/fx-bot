import { describe, expect, it } from 'vitest';
import { fixInstagram, isInstagram } from '../src/fix-urls';
import { cleanAndFixUrlsTest } from './fix-urls-common';

const urls = [
	// prettier-ignore
	[
		'https://instagram.com/reel/C7XX1y9XX9Q',
		'https://ddinstagram.com/reel/C7XX1y9XX9Q'
	],
	[
		'https://instagram.com/reel/C7XX1y9XX9Q?utm_source=ig&fbclid=123',
		'https://ddinstagram.com/reel/C7XX1y9XX9Q?utm_source=ig&fbclid=123',
	],
	[
		'https://www.instagram.com/p/C8mqrf_ySBs/?igsh=MTRoN2I0NXdnaXkwYw%3D%3D&img_index=5',
		'https://ddinstagram.com/p/C8mqrf_ySBs/?igsh=MTRoN2I0NXdnaXkwYw%3D%3D&img_index=5',
	],
	[
		'https://instagram.com/reel/C7XX1y9XX9Q?utm_source=ig&fbclid=123&gclid=123',
		'https://ddinstagram.com/reel/C7XX1y9XX9Q?utm_source=ig&fbclid=123&gclid=123',
	],
	['https://www.instagram.com/reel/C7XX1y9XX9Q', 'https://ddinstagram.com/reel/C7XX1y9XX9Q'],
	[
		'https://www.instagram.com/reel/C7XX1y9XX9Q?utm_source=ig&fbclid=123',
		'https://ddinstagram.com/reel/C7XX1y9XX9Q?utm_source=ig&fbclid=123',
	],
	[
		'https://www.instagram.com/reel/C7XX1y9XX9Q?utm_source=ig&fbclid=123&gclid=123',
		'https://ddinstagram.com/reel/C7XX1y9XX9Q?utm_source=ig&fbclid=123&gclid=123',
	],
];

const validUrls = urls.map((v) => v[0]);
const invalidUrls = urls.map((v) => v[1]);
const cleanedUrls = urls.map((v) => [v[0], v[1].split('?')[0].split('#')[0]]);

describe('instagram', () => {
	describe('isInstagram', () => {
		it.each(validUrls)(`should return true for %s`, (url) => {
			expect(isInstagram(new URL(url))).toBe(true);
		});

		it.each(
			invalidUrls.concat(
				['https://www.ddinstagram.com'],
				['https://www.ddinstagram.com/reel'],
				['https://www.ddinstagram.com/reel/'],
				['https://www.ddinstagram.com/?utm_source=ig&fbclid=123&gclid=123'],
				['https://www.ddinstagram.com/reel?utm_source=ig&fbclid=123&gclid=123'],
				['https://www.ddinstagram.com/reel/?utm_source=ig&fbclid=123&gclid=123'],
			),
		)(`should return false for %s`, (url) => {
			expect(isInstagram(new URL(url))).toBe(false);
		});
	});

	describe('fixInstagram', () => {
		it.each(urls)(`should fix url for %s to %s`, (url, expectedUrl) => {
			expect(fixInstagram(new URL(url))).toEqual(new URL(expectedUrl));
		});

		it.each(
			invalidUrls.concat(
				['https://www.ddinstagram.com'],
				['https://www.ddinstagram.com/gag'],
				['https://www.ddinstagram.com/gag/'],
				['https://www.ddinstagram.com/?utm_source=ig&fbclid=123&gclid=123'],
				['https://www.ddinstagram.com/gag?utm_source=ig&fbclid=123&gclid=123'],
				['https://www.ddinstagram.com/gag/?utm_source=ig&fbclid=123&gclid=123'],
			),
		)(`should not fix url for %s`, (url) => {
			expect(fixInstagram(new URL(url))).toEqual(new URL(url));
		});
	});

	describe('instagram', cleanAndFixUrlsTest(cleanedUrls, invalidUrls));
});
