const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/deepseek',
    createProxyMiddleware({
      target: 'https://api.deepseek.com',
      changeOrigin: true,
      secure: true,
      pathRewrite: { '^/deepseek': '' },
      headers: {
        // Ensure Authorization header is always present from env
        Authorization: process.env.DEEPSEEK_API_KEY ? `Bearer ${process.env.DEEPSEEK_API_KEY}` : undefined,
      },
      onProxyReq: (proxyReq) => {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (apiKey) {
          proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
        }
        proxyReq.setHeader('Content-Type', 'application/json');
      }
    })
  );
};


