import "reflect-metadata";
import "dotenv/config";
import { createServer } from "./server.js";

const main = async () => {
  const app = await createServer();
  const PORT = Number(process.env.PORT) || 4000;
  const HOST = process.env.HOST || "localhost";

  app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
  });
};

main().catch((err) => console.error(err));
