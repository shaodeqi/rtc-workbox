import fetchRTC from './fetch-rtc';
console.log(fetchRTC);

export const register = () => {
    if ('serviceWorker' in navigator) {
        // serviceWorker 注册
        window.addEventListener('load', () => {
            navigator.serviceWorker.addEventListener('message', ({data}) => {
                console.log('serviceWorker message', data);
                if (data.url.includes('text.json')) {
                    fetchRTC(data.url);
                    // navigator.serviceWorker.controller.postMessage('测试4');
                }
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