import "dotenv/config";
import app from "./app";

if (process.env.ENABLE_WORKER !== "false") {
  import("./worker");
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
