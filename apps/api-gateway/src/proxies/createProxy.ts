import { createProxyMiddleware } from "http-proxy-middleware";

export const createServiceProxy = (
  target: string,
  serviceName: string,
  rewrite: string,
) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      [rewrite]: "",
    },
    // lifecycle 
    on: {
    // proxyReq: Logs outgoing requests as they are intercepted and forwarded,
      proxyReq: (proxyReq, req) => {
        console.log(`[${serviceName}] Proxying ==${req.method} ${req.url} -> ${target}`);
      },
      error: (err, req, res: any) => {
        console.error(`[${serviceName}] Proxy Error:`, err.message);
        if (!res.headersSent) {
          res.writeHead(503, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: false,
              message: `${serviceName} is unavailable`,
            })
          );
        }
      },
    },

    proxyTimeout: 15000,
    timeout: 15000,
  });