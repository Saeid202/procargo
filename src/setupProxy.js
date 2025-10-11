const { createProxyMiddleware } = require('http-proxy-middleware');

const getDeepSeekApiKey = () => {
  const rawKey = process.env.DEEPSEEK_API_KEY;
  if (!rawKey) {
    return null;
  }

  const trimmedKey = rawKey.trim();
  const normalized = trimmedKey.toLowerCase();
  if (!trimmedKey || normalized === 'undefined' || normalized === 'null') {
    return null;
  }

  return trimmedKey;
};

module.exports = function(app) {
  app.use(
    '/deepseek',
    createProxyMiddleware({
      target: 'https://api.deepseek.com',
      changeOrigin: true,
      secure: true,
      pathRewrite: { '^/deepseek': '' },
      headers: (() => {
        const apiKey = getDeepSeekApiKey();
        if (!apiKey) {
          return {};
        }
        return {
          Authorization: `Bearer ${apiKey}`,
        };
      })(),
      onProxyReq: (proxyReq) => {
        const apiKey = getDeepSeekApiKey();
        if (apiKey) {
          proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
        }
        proxyReq.setHeader('Content-Type', 'application/json');
      }
    })
  );
};


