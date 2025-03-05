import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import { pluginStylus } from '@rsbuild/plugin-stylus';
import AutoImport from 'unplugin-auto-import/rspack';
import Components from 'unplugin-vue-components/rspack';

export default defineConfig({
    plugins: [
        pluginVue(),
        pluginStylus(),
    ],
    tools: {
        rspack: {
            plugins: [
                AutoImport({
                    //
                }),
                Components({
                    //
                }),
            ]
        },
        htmlPlugin: false
    },
    server: {
        middlewareMode: true,
    },
    environments: {
        'xiezq.www.client': {
            source: {
                entry: {
                    index: './src/pages/xiezq.www/index.client.js',
                },
            },
            output: {
                target: 'web',
                manifest: true,
                distPath: {
                    root: './dist/xiezq.www.client',
                    css: 'css',
                    cssAsync: 'css/async',
                    js: 'js',
                    jsAsync: 'js/async',
                    svg: 'images',
                    font: 'fonts',
                    wasm: 'wasm',
                    image: 'images',
                    media: 'media',
                    assets: 'others'
                }
            },
        },
        'xiezq.www.server': {
            source: {
                entry: {
                    index: './src/pages/xiezq.www/index.server.js',
                },
            },
            output: {
                target: 'node',
                distPath: {
                    root: './dist/xiezq.www.server',
                }
            }
        },
    },
});
