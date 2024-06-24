import { describe, expect, it } from 'vitest';
import { fixTiktok, isTiktok } from '../src/fix-urls';
import { cleanAndFixUrlsTest } from './fix-urls-common';

// prettier-ignore
const urls = [
		// tiktok.com
		['https://tiktok.com/@muztvzq/video/7371692885990722821', 'https://vxtiktok.com/@muztvzq/video/7371692885990722821'],
		['https://tiktok.com/@muztvzq/video/7371692885990722821?#test', 'https://vxtiktok.com/@muztvzq/video/7371692885990722821?#test'],
		['https://tiktok.com/@muztvzq/video/7371692885990722821?is_from_webapp=1&sender_device=pc', 'https://vxtiktok.com/@muztvzq/video/7371692885990722821?is_from_webapp=1&sender_device=pc'],
		// www.tiktok.com
		['https://www.tiktok.com/@muztvzq/video/7371692885990722821', 'https://www.vxtiktok.com/@muztvzq/video/7371692885990722821'],
		['https://www.tiktok.com/@muztvzq/video/7371692885990722821?#pc', 'https://www.vxtiktok.com/@muztvzq/video/7371692885990722821?#pc'],
		['https://www.tiktok.com/@muztvzq/video/7371692885990722821?is_from_webapp=1&sender_device=pc', 'https://www.vxtiktok.com/@muztvzq/video/7371692885990722821?is_from_webapp=1&sender_device=pc'],
		// vm.tiktok.com
		['https://vm.tiktok.com/ZMrY3Fcm6', 'https://vm.vxtiktok.com/ZMrY3Fcm6'],
		['https://vm.tiktok.com/ZMr2sWyu9', 'https://vm.vxtiktok.com/ZMr2sWyu9'],
		['https://vm.tiktok.com/ZMrY3Fcm6#1', 'https://vm.vxtiktok.com/ZMrY3Fcm6#1'],
		['https://vm.tiktok.com/ZMrY3Fcm6?#1', 'https://vm.vxtiktok.com/ZMrY3Fcm6?#1'],
		['https://vm.tiktok.com/ZMrY3Fcm6?utm_source=ig&fbclid=123', 'https://vm.vxtiktok.com/ZMrY3Fcm6?utm_source=ig&fbclid=123'],
		['https://vm.tiktok.com/ZMrY3Fcm6?utm_source=ig&fbclid=123&gclid=123', 'https://vm.vxtiktok.com/ZMrY3Fcm6?utm_source=ig&fbclid=123&gclid=123'],
];

const validUrls = urls.map((v) => v[0]);
const invalidUrls = urls.map((v) => v[1]);
const cleanedUrls = urls.map((v) => [v[0], v[1].split('?')[0].split('#')[0]]);

describe('tiktok', () => {
	describe('isTiktok', () => {
		it.each(validUrls)(`should return true for %s`, (url) => {
			expect(isTiktok(new URL(url))).toBe(true);
		});

		it.each(invalidUrls)(`should return false for %s`, (url) => {
			expect(isTiktok(new URL(url))).toBe(false);
		});
	});

	// prettier-ignore
	describe('fixTiktok', () => {
		it.each(urls)(`should fix url for %s to %s`, (url, expectedUrl) => {
			expect(fixTiktok(new URL(url))).toEqual(new URL(expectedUrl));
		});

		it.each(invalidUrls)(`should not fix url for %s`, (url) => {
			expect(fixTiktok(new URL(url))).toEqual(new URL(url));
		});
	});

	describe('tiktok', cleanAndFixUrlsTest(cleanedUrls, invalidUrls));
});
