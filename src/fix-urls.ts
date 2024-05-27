
const map = {
	"9gag.com": "fx9gag.kxalex.workers.dev",
	"instagram.com": "ddinstagram.com",
	"twitter.com": "fxtwitter.com",
	"x.com": "fixupx.com",
	"reddit.com": "rxddit.com",
};

const map_tiktok = {
	"tiktok.com": "vxtiktok.com",
	".tiktok.com": ".vxtiktok.com",
};

function cleanAndFixUrls(str: string): [boolean, string] {
	let updated = false;
	const urlRegex = /(https?:\/\/\S+)/gi;
	const matches = str.match(urlRegex) || [];
	const cleanedUrls = matches.map((urlString) => {
		try {
			const url = new URL(urlString);
			const unwantedParams = ['utm_', 'fbclid', 'gclid', 'msclkid', 'igshid', 'igsh'];

			for (const param of unwantedParams) {
				const regex = new RegExp(`([?&])${param}[^&=]*=[^&]*(&?)`, 'gi');
				url.search = url.search.replace(regex, (_match, p1, p2) => {
					return p2 ? p1 : '';
				});
			}

			url.search = url.search.replace(/[?&]$/, '');
			url.hash = url.hash.replace(/[?&]$/, '');

			for (const [key, value] of Object.entries(map)) {
				if (url.host.endsWith(key)) {
					url.host = value;
					updated = true;
					break;
				}
			}

			for (const [key, value] of Object.entries(map_tiktok)) {
				if (url.host === key || url.host.endsWith(key)) {
					url.host = url.host.replace(key, value);
					url.search = '';
					url.hash = '';
					updated = true;
					break;
				}
			}

			return url.toString();
		} catch (err) {
			// Skip invalid URLs
			console.error("Error cleaning URL %s: %s", urlString, err);
			return urlString;
		}
	});

	// @ts-ignore
	return [ updated, str.replace(urlRegex, () => cleanedUrls.shift()) ];
}

export { cleanAndFixUrls }
