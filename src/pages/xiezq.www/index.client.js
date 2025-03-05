import { createSSRApp } from 'vue';
import App from './app.vue';

// if (!import.meta.env.SSR) {
//     const script = document.querySelector('script[data-pinia]');
//     window.X_PINIA = {};
//     if (script) {
//         window.X_PINIA = JSON.parse(script.innerText.replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
//     }
// }

export const createApp = () => {
    const app = createSSRApp(App);

    return { app };
};
