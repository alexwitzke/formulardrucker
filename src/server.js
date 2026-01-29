// server.js
import express from "express";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

const app = express();
const PORT = 3000;

// --- Absolute Pfade ---
const DATA_DIR = "/data"; // gemountetes Volume für PDFs + config.json
const PUBLIC_DIR = path.join(process.cwd(), "src/public");

const VIEWS_DIR = path.join(process.cwd(), "src/views");
const CONFIG_PATH = path.join(DATA_DIR, "config.json");

// --- Express Setup ---
app.set("view engine", "pug");
app.set("views", VIEWS_DIR);
app.use("/public", express.static(PUBLIC_DIR)); // PDF.js, CSS, JS
app.use("/data", express.static(DATA_DIR));     // PDFs + config.json

// --- Config laden ---
function getConfig() {
    if (!fs.existsSync(CONFIG_PATH)) {
        throw new Error(`config.json nicht gefunden in ${CONFIG_PATH}`);
    }
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}

// --- Startseite ---
app.get("/", (req, res) => {
    try {
        const config = getConfig();
        res.render("index", { forms: config.forms });
    } catch (err) {
        console.error(err);
        res.status(500).send("Fehler beim Laden der Konfiguration");
    }
});

// --- Druckauftrag ---
app.post("/print/:id", express.json(), (req, res) => {
    try {
        const config = getConfig();
        const form = config.forms.find(f => f.id === req.params.id);
        if (!form) return res.status(404).send("Formular nicht gefunden");

        const pdfPath = path.join(DATA_DIR, "pdfs", form.file);
        if (!fs.existsSync(pdfPath)) return res.status(404).send("PDF nicht gefunden");

        const options = [];
        if (form.duplex) options.push("-o OptionDuplex=True");
        //if (form.copies) options.push(`-n ${form.copies}`);

        const cmd = `lp -d ${form.printer} ${options.join(" ")} "${pdfPath}"`;

        for (let i = 0; i < form.length; i++) {
            exec(cmd, (err, stdout, stderr) => { });
        }

        console.log(`Druckauftrag gesendet: ${stdout}`);
        res.send("Druckauftrag gesendet");
    } catch (err) {
        console.error(err);
        res.status(500).send("Fehler beim Drucken");
    }
});

// --- Server starten ---
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
