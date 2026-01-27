import express from "express";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

const app = express();
const PORT = 3000;

const DATA_DIR = "/data";
const CONFIG_PATH = path.join(DATA_DIR, "config.json");

app.set("view engine", "pug");
app.set("views", path.join(process.cwd(), "src/views"));
app.use("/public", express.static(path.join(process.cwd(), "src/public")));

function getConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}

app.get("/", (req, res) => {
  const config = getConfig();
  res.render("index", { forms: config.forms });
});

app.post("/print/:id", express.json(), (req, res) => {
  try {
    const config = getConfig();
    const form = config.forms.find(f => f.id === req.params.id);
    if (!form) return res.status(404).send("Formular nicht gefunden");

    const pdfPath = path.join(DATA_DIR, "pdfs", form.file);
    if (!fs.existsSync(pdfPath)) return res.status(404).send("PDF nicht gefunden");

    const options = [];
    if (form.duplex) options.push("-o sides=two-sided-long-edge");
    if (form.copies) options.push(`-n ${form.copies}`);

    const cmd = `lp -d ${config.printer} ${options.join(" ")} "${pdfPath}"`;
    exec(cmd);

    res.send("Druckauftrag gesendet");
  } catch (err) {
    console.error(err);
    res.status(500).send("Fehler beim Drucken");
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
