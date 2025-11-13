import "reflect-metadata";
import "dotenv/config";
import { createServer } from "./server.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Application, Request, Response } from "express";

const isLocal = process.env.NODE_ENV === "development";

let app: Application;

const main = async () => {
  app = await createServer();

  if (isLocal) {
    const PORT = Number(process.env.PORT) || 4000;
    const HOST = process.env.HOST || "localhost";
    app.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}`);
    });
  }
};

main().catch((err) => console.error(err));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!app) {
    app = await createServer();
  }

  const expressReq = req as unknown as Request;
  const expressRes = res as unknown as Response;

  await new Promise<void>((resolve, reject) => {
    app(expressReq, expressRes, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
