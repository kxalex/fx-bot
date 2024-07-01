import { Features } from './features';

const regex9gag = /^(www\.)?9gag\.com/i;
const regexInstagram = /^(www\.)?instagram\.com/i;
const regexX = /^(www\.)?x\.com/i;
const regexTwitter = /^(www\.)?twitter\.com/i;
const regexTiktok = /^(www\.|[a-z]{2}\.)?tiktok\.com/i;
const regexReddit = /^(www\.)?reddit\.com/i;

const is9gag = (url: URL) => regex9gag.test(url.host);
const isInstagram = (url: URL) => regexInstagram.test(url.host);
const isTiktok = (url: URL) => regexTiktok.test(url.host);
const isX = (url: URL) => regexTwitter.test(url.host) || regexX.test(url.host);
const isReddit = (url: URL) => regexReddit.test(url.host);

function fix9gag(url: URL): URL {
	if (!is9gag(url)) {
		return url;
	}

	const newUrl = new URL(url);
	newUrl.host = 'fx9gag.com';
	return newUrl;
}

function fixInstagram(url: URL) {
	if (!isInstagram(url)) {
		return url;
	}

	const newUrl = new URL(url);
	newUrl.host = 'ddinstagram.com';
	return newUrl;
}

function fixTiktok(url: URL) {
	if (!isTiktok(url)) {
		return url;
	}

	const newUrl = new URL(url);
	newUrl.host = url.host.replace('tiktok.com', 'vxtiktok.com');
	return newUrl;
}

function fixX(url: URL): URL {
	if (!isX(url)) {
		return url;
	}

	const newUrl = new URL(url);
	if (regexTwitter.test(url.host)) {
		newUrl.host = url.host.replace('twitter.com', 'fxtwitter.com');
	} else {
		newUrl.host = url.host.replace('x.com', 'fixupx.com');
	}
	return newUrl;
}

function fixReddit(url: URL) {
	const newUrl = new URL(url);
	newUrl.host = 'rxddit.com';
	return newUrl;
}

// mutates the URL object
function clean(url: URL): URL {
	url.search = '';
	url.hash = '';
	return url;
}

function cleanAndFixUrls(str: string, features: Features): [boolean, string] {
	let updated = false;
	const urlRegex = /(https?:\/\/\S+)/gi;
	const matches = str.match(urlRegex) || [];
	const cleanedUrls = matches.map((urlString) => {
		try {
			const url = new URL(urlString);

			let newUrl: URL;
			if (is9gag(url) && features.gag) {
				newUrl = clean(fix9gag(url));
				updated = true;
			} else if (isInstagram(url) && features.instagram) {
				newUrl = clean(fixInstagram(url));
				updated = true;
			} else if (isX(url) && features.x) {
				newUrl = clean(fixX(url));
				updated = true;
			} else if (isTiktok(url) && features.tiktok) {
				newUrl = clean(fixTiktok(url));
				updated = true;
			} else if (isReddit(url) && features.reddit) {
				newUrl = clean(fixReddit(url));
				updated = true;
			} else {
				return urlString;
			}

			return newUrl.toString();
		} catch (err) {
			// Skip invalid URLs
			console.error('Error cleaning URL %s: %s', urlString, err);
			return urlString;
		}
	});

	// @ts-ignore
	return [updated, str.replace(urlRegex, () => cleanedUrls.shift())];
}

export {
	is9gag,
	isInstagram,
	isReddit,
	isTiktok,
	isX,
	fix9gag,
	fixInstagram,
	fixReddit,
	fixTiktok,
	fixX,
	cleanAndFixUrls,
};
