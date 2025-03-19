import path from 'path';
import fse from 'fs-extra';
import { createRsbuild, loadConfig, logger } from '@rsbuild/core';
import Koa from 'koa';
import koaConnect from 'koa-connect';
import koaStatic from 'koa-static';

const koa = new Koa();
const templateHtml = fse.readFileSync(path.resolve(process.cwd(), 'src/server/template.html'), 'utf-8');
let manifest;
let rsbuild;
let rsbuildServer;

const getManifest = () => JSON.parse(fse.readFileSync(path.resolve(process.cwd(), 'dist/xiezq.www.client/manifest.json'), 'utf-8'));

koa.use(async (ctx, next) => {
    ctx.response.status = 200;
    await next();
});

if (process.env.NODE_ENV == 'development') {
    const rsbuildConfig = await loadConfig();
    rsbuild = await createRsbuild({ rsbuildConfig: rsbuildConfig.content });
    rsbuild.onDevCompileDone(() => manifest = getManifest());
    rsbuildServer = await rsbuild.createDevServer();
    koa.use(koaConnect(rsbuildServer.middlewares));
} else {
    manifest = getManifest();
    koa.use(koaStatic(path.join(process.cwd(), 'dist/xiezq.www.client')));
}

koa.use(async (ctx, next) => {
    ctx.response.status = 404;

    if (ctx.request.path == '/') {
        try {
            let createApp;
            let html;

            if (process.env.NODE_ENV == 'development') {
                createApp = (await rsbuildServer.environments['xiezq.www.server'].loadBundle('index')).createApp;
                html = await createApp();
            } else {
                createApp = (await import(path.join(process.cwd(), 'dist/xiezq.www.server/index.js'))).createApp;
                html = await createApp();
            }

            const scriptTags = manifest.entries['index'].initial.jd.map((url) => `<script src="${url}" defer></script>`).join('\n');
            const styleTags = manifest.entries['index'].initial.css.map((file) => `<link rel="stylesheet" href="${file}">`).join('\n');

            ctx.response.status = 200;
            ctx.response.type = 'text/html';
            ctx.response.body = templateHtml.replace('<!--app-content-->', html).replace('<!--app-head-->', `${scriptTags}\n${styleTags}`);
        } catch (err) {
            logger.error('SSR 渲染失败\n', err);
            await next();
        }
    } else {
        await next();
    }
});

const port = 3000;
const httpServer = koa.listen(port, () => {
    if (process.env.NODE_ENV == 'development') {
        rsbuildServer.afterListen();
    }
    console.log(`Server started at http://localhost:${port}`);
});

if (process.env.NODE_ENV == 'development') {
    rsbuildServer.connectWebSocket({ server: httpServer });
}
