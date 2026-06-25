import { createProxyMiddleware } from "http-proxy-middleware";
import { config } from "../config";

export const authProxy = createProxyMiddleware({
  target: config.services.auth,
  changeOrigin: true,

  plugins: [
    (proxyServer) => {
      proxyServer.on("error", (err, req, res: any) => {
        console.error("Auth Service Error:", err.message);

        if (!res.headersSent) {
          res.writeHead(503, {
            "Content-Type": "application/json",
          });

          res.end(
            JSON.stringify({
              success: false,
              message: "Auth Service unavailable",
            }),
          );
        }
      });
    },
  ],
});
 