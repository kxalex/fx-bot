import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

// noinspection JSUnusedGlobalSymbols
export default defineWorkersConfig({
	test: {
		typecheck: {
			enabled: true,
		},
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
