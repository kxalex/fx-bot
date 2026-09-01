interface Features {
	gag: boolean;
	instagram: boolean;
	reddit: boolean;
	tiktok: boolean;
	threads: boolean;
	x: boolean;
}

const defaultFeatures: Features = {
	gag: false,
	instagram: true,
	reddit: true,
	tiktok: true,
	threads: true,
	x: true,
};

export { defaultFeatures };
export type { Features };
