import fetchRTC from './fetch-rtc';

export const register = () => {
    if ('serviceWorker' in navigator) {
        // serviceWorker 注册
        window.addEventListener('load', () => {
            navigator.serviceWorker.addEventListener('message', ({data}) => {
                console.log('【serviceWorker】main message', data);
                fetchRTC(data.url).then(res => {
                    console.log('fetchRTC 结果', res);
                    navigator.serviceWorker.controller.postMessage({
                        id: data.url,
                        response: res,
                    });
                });
            })
            navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
        });
    }
}