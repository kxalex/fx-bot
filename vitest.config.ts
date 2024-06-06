import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

// noinspection JSUnusedGlobalSymbols
export default defineWorkersConfig({
	test: {
		coverage: {
			provider: 'istanbul',
		},
		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.toml' },
			},
		},
	},
});
