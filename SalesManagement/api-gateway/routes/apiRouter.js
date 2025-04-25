const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const router = express.Router();

router.use(
  '/products',
  createProxyMiddleware({
    target: 'http://localhost:3004',
    changeOrigin: true,
    pathRewrite: { '^/products': '/api/products' },
  })
);

module.exports = router;