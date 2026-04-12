import "dotenv/config";
import app from "./app.js";
import "./wrokers/filconversionWorker.js";
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
