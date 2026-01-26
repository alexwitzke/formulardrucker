import express from "express";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === Pug als View Engine ===
app.set("view engine", "pug");
app.set("views", path.join(process.cwd(), "src", "views"));

// === Config laden ===
const CONFIG_PATH = "/data/config.json";
let config = {};
if (fs.existsSync(CONFIG_PATH)) {
    try {
        config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    } catch (err) {
        console.error("Fehler beim Lesen der config.json:", err);
        config = { printer: "HP2015DN", basePath: "/data/pdfs", forms: [] };
    }
} else {
    console.error("config.json nicht gefunden unter /data");
    config = { printer: "HP2015DN", basePath: "/data/pdfs", forms: [] };
}

// === Helper: PDF drucken ===
function printPDF(filePath, formConfig) {
    if (!filePath || !fs.existsSync(filePath)) {
        throw new Error("PDF-Datei nicht gefunden oder filePath undefined");
    }

    const tmpPS = path.join("/tmp", path.basename(filePath, ".pdf") + ".ps");

    // PDF → PostScript konvertieren
    execSync(
        `gs -dNOPAUSE -dBATCH -sDEVICE=ps2write -sOutputFile="${tmpPS}" "${filePath}"`
    );

    // lp Optionen
    const lpOptions = [];
    if (formConfig.duplex) lpOptions.push("-o sides=two-sided-long-edge");
    if (formConfig.copies) lpOptions.push(`-n ${formConfig.copies || 1}`);

    const cmd = `lp -d ${config.printer} ${lpOptions.join(" ")} "${tmpPS}"`;
    console.log("Druckbefehl:", cmd);
    execSync(cmd);

    fs.unlinkSync(tmpPS);
}

// === Route: Index-Seite mit Vorschau ===
app.get("/", (req, res) => {
    const forms = (config.forms || []).map(f => ({
        name: f.name || "Unbenannt",
        duplex: f.duplex || false,
        copies: f.copies || 1,
        // RAW: basePath + file wird hier für iframe-Vorschau genutzt
        url: f.file ? path.join(config.basePath || "/data/pdfs", f.file) : null
    }));

    res.render("index", { forms });
});

// === Statische PDFs für Browser-Vorschau ===
app.use("/pdfs", express.static(config.basePath || "/data/pdfs"));

// === Route: Druckauftrag ===
app.post("/print", (req, res) => {
    const { formName } = req.body;
    if (!formName) return res.status(400).json({ error: "formName fehlt" });

    const form = (config.forms || []).find(f => f.name === formName);
    if (!form) return res.status(404).json({ error: "Formular nicht gefunden" });

    if (!form.file)
        return res.status(400).json({ error: "file fehlt in config" });

    const filePath = path.join(config.basePath || "/data/pdfs", form.file);
    if (!fs.existsSync(filePath))
        return res.status(404).json({ error: "PDF-Datei nicht gefunden" });

    try {
        printPDF(filePath, form);
        res.json({ status: "ok", message: `Druckauftrag für ${formName} gestartet` });
    } catch (err) {
        console.error("Fehler beim Drucken:", err);
        res.status(500).json({ error: "Fehler beim Drucken" });
    }
});

// === Server starten ===
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
