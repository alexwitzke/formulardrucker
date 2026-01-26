import express from "express";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pug als View Engine
app.set("view engine", "pug");
app.set("views", path.join(process.cwd(), "src", "views"));

// Config laden
const CONFIG_PATH = "/data/config.json";
let config = {};
if (fs.existsSync(CONFIG_PATH)) {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
} else {
  console.error("config.json nicht gefunden unter /data");
}

// Helper: PDF drucken
function printPDF(filePath, formConfig) {
  const tmpPS = path.join("/tmp", path.basename(filePath, ".pdf") + ".ps");

  // PDF → PostScript
  execSync(
    `gs -dNOPAUSE -dBATCH -sDEVICE=ps2write -sOutputFile="${tmpPS}" "${filePath}"`
  );

  // lp Optionen
  const lpOptions = [];
  if (formConfig.duplex) lpOptions.push("-o sides=two-sided-long-edge");
  if (formConfig.copies) lpOptions.push(`-n ${formConfig.copies}`);

  const cmd = `lp -d ${config.printer} ${lpOptions.join(" ")} "${tmpPS}"`;
  console.log("Druckbefehl:", cmd);
  execSync(cmd);

  fs.unlinkSync(tmpPS);
}

// Index-Seite: alle Formulare mit Vorschau
app.get("/", (req, res) => {
  // Vorschauen vorbereiten: wir nutzen PDF.js (Browser) oder nur Pfade hier
  const forms = config.forms.map(f => ({
    ...f,
    url: `/pdfs/${path.basename(f.pdfPath)}`,
  }));

  res.render("index", { forms });
});

// Statische PDFs für Browser-Vorschau
app.use("/pdfs", express.static("/data/pdfs"));

// Druck-Endpoint
app.post("/print", (req, res) => {
  const { formName } = req.body;
  const form = config.forms.find(f => f.name === formName);
  if (!form) return res.status(404).json({ error: "Formular nicht gefunden" });

  const filePath = path.join("/data", form.pdfPath);
  if (!fs.existsSync(filePath))
    return res.status(404).json({ error: "PDF-Datei nicht gefunden" });

  try {
    printPDF(filePath, form);
    res.json({ status: "ok", message: `Druckauftrag für ${formName} gestartet` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Drucken" });
  }
});

// Server starten
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
