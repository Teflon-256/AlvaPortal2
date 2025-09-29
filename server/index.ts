import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Handle www redirect - must be first middleware
app.use((req, res, next) => {
  const host = req.get('host');
  if (host && host.startsWith('www.')) {
    const nonWwwHost = host.slice(4); // Remove 'www.'
    return res.redirect(301, `https://${nonWwwHost}${req.originalUrl}`);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // Serve static files from Vite build output
    const distPath = path.join(import.meta.dirname, "../dist/public");
    app.use(express.static(distPath));

    // Serve index.html at root
    app.get("/", (_req: Request, res: Response) => {
      res.sendFile("index.html", { root: distPath });
    });

    // Fallback for SPA routing
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile("index.html", { root: distPath });
    });
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
