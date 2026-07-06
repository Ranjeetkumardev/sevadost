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
    plugins: [
      (proxyServer) => {
        proxyServer.on("error", (_, req, res: any) => {
          if (!res.headersSent) {
            res.writeHead(503, {
              "Content-Type": "application/json",
            });

            res.end(
              JSON.stringify({
                success: false,
                message: `${serviceName} unavailable`,
              }),
            );
          }
        });
      },
    ],
  });

// import { createProxyMiddleware } from "http-proxy-middleware";

// export const createServiceProxy = (
//   target: string,
//   serviceName: string,
//   pathRewrite?: Record<string, string>,
// ) => {
//   return createProxyMiddleware({
//     target,
//     changeOrigin: true,

//     pathRewrite,

//     plugins: [
//       (proxyServer) => {
//         proxyServer.on("error", (_, req, res: any) => {
//           console.error(`${serviceName} unavailable`);

//           if (!res.headersSent) {
//             res.writeHead(503, {
//               "Content-Type": "application/json",
//             });

//             res.end(
//               JSON.stringify({
//                 success: false,
//                 message: `${serviceName} unavailable`,
//               }),
//             );
//           }
//         });
//       },
//     ],
//   });
// };
 