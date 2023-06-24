import { nodeResolve } from '@rollup/plugin-node-resolve';

// Rollup config
export default {
    input: './out/index.js',
    output: {
        file: './bin/bundle.js',
        format: 'cjs'
    },
    plugins: [nodeResolve()]
}