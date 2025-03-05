import { createSSRApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import App from './app.vue';

export const createApp = async () => {
    const app = createSSRApp(App);
    return await renderToString(app);
}
