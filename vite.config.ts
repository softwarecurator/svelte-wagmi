import { sveltekit } from '@sveltejs/kit/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { defineConfig } from 'vite';
import { esbuildCommonjs } from '@originjs/vite-plugin-commonjs';

export default defineConfig({
	plugins: [
		nodePolyfills({
			exclude: ['fs'],
			globals: {
				Buffer: true,
				global: true,
				process: true
			},
			protocolImports: true
		}),
		sveltekit()
	],
	build: {
		commonjsOptions: {
			transformMixedEsModules: true
		}
	},
	optimizeDeps: {
		esbuildOptions: {
			plugins: [esbuildCommonjs(['@wagmi/core'])]
		}
	}
});
