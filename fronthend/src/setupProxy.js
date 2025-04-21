// frontend/src/setupProxy.js
import { createProxyMiddleware } from "http-proxy-middleware";

(app) => {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:3000",
      changeOrigin: true,
    })
  );
}
