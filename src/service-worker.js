export const register = () => {
    if ('serviceWorker' in navigator) {
        // serviceWorker 注册
        window.addEventListener('load', () => {
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