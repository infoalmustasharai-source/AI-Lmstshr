import dotenv from "dotenv";
import app from "./app.js";
import { initializeDatabase } from "./lib/database.js";

dotenv.config();

initializeDatabase();

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
