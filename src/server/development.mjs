import path from 'path';
import fse from 'fs-extra';
import { createRsbuild, loadConfig, logger } from '@rsbuild/core';
import Koa from 'koa';
import koaConnect from 'koa-connect';
import koaStatic from 'koa-static';

const templateHtml = fse.readFileSync(path.resolve(process.cwd(), 'src/server/template.html'), 'utf-8');

let manifest;

const rsbuildConfig = await loadConfig();
const rsbuild = await createRsbuild({ rsbuildConfig: rsbuildConfig.content });

rsbuild.onDevCompileDone(async () => {
    manifest = await fse.promises.readFile(path.resolve(process.cwd(), 'dist/xiezq.www.client/manifest.json'), 'utf-8');
})

const koa = new Koa();

const rsbuildServer = await rsbuild.createDevServer();

// koa.use(koaStatic(path.join(process.cwd(), 'dist/xiezq.www.client')));

koa.use(koaConnect(rsbuildServer.middlewares));

koa.use(async (ctx, next) => {
    console.log(ctx.request.path);

    if (ctx.request.path == '/') {
        try {
            const { createApp } = await rsbuildServer.environments['xiezq.www.server'].loadBundle('index');

            const html = await createApp();

            const { entries } = JSON.parse(manifest);

            const { js = [], css = []} = entries['index'].initial;

            const scriptTags = js.map((url) => `<script src="${url}" crossorigin defer></script>`).join('\n');
            const styleTags = css.map((file) => `<link rel="stylesheet" href="${file}">`).join('\n');

            ctx.response.status = 200;
            ctx.response.type = 'text/html';
            ctx.response.body = templateHtml.replace('<!--app-content-->', html).replace('<!--app-head-->', `${scriptTags}\n${styleTags}`);
        } catch (err) {
            logger.error('SSR render error, downgrade to CSR...\n', err);
            await next();
        }
    } else {
        await next();
    }
});

const httpServer = koa.listen(rsbuildServer.port, () => {
    rsbuildServer.afterListen();
    console.log(`Server started at http://localhost:${rsbuildServer.port}`);
});

rsbuildServer.connectWebSocket({ server: httpServer });

// return {
//     close: async () => {
//         await rsbuildServer.close();
//         httpServer.close();
//     },
// };
