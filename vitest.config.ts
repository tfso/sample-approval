import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        testTimeout: Infinity,

        // perfomance options
        // https://vitest.dev/guide/improving-performance
        fileParallelism: false,
        isolate: false,
        // you can also disable isolation only for specific pools
        poolOptions: {
            forks: {
                isolate: false,
            },
        },
    },

})