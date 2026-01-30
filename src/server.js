// server.js
import express from "express";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

const app = express();
const PORT = 3000;

// --- Pfade ---
const DATA_DIR = "/data";
const PUBLIC_DIR = path.join(process.cwd(), "src/public");
const VIEWS_DIR = path.join(process.cwd(), "src/views");
const CONFIG_PATH = path.join(DATA_DIR, "config.json");

// --- Queue ---
const printQueue = [];
let isPrinting = false;
const PRINT_DELAY_MS = 4000; // <<<<<< WICHTIG (3–5s empfohlen)

// --- Express Setup ---
app.set("view engine", "pug");
app.set("views", VIEWS_DIR);
app.use("/public", express.static(PUBLIC_DIR));
app.use("/data", express.static(DATA_DIR));

function getConfig() {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}

// --- Queue Worker ---
function processQueue() {
    if (isPrinting) return;
    if (printQueue.length === 0) return;

    isPrinting = true;
    const job = printQueue.shift();

    console.log("Starte Druckjob:", job.cmd);

    exec(job.cmd, (err, stdout, stderr) => {
        if (err) {
            console.error("Druckfehler:", err);
            console.error(stderr);
        } else {
            console.log("Druck abgeschlossen");
        }

        setTimeout(() => {
            isPrinting = false;
            processQueue();
        }, job.delayMs);
    });
}

// --- Routes ---
app.get("/", (req, res) => {
    const config = getConfig();
    res.render("index", { forms: config.forms });
});

app.post("/print/:id", (req, res) => {
    try {
        const config = getConfig();
        const form = config.forms.find(f => f.id === req.params.id);
        if (!form) return res.status(404).send("Formular nicht gefunden");

        const pdfPath = path.join(DATA_DIR, "pdfs", form.file);
        if (!fs.existsSync(pdfPath)) {
            return res.status(404).send("PDF nicht gefunden");
        }

        const copies = form.copies ?? 1;

        for (let i = 0; i < copies; i++) {
            const options = [];

            if (form.duplex) {
                options.push("-o sides=two-sided-long-edge");
            }

            const cmd = `lp -d ${form.printer} ${options.join(" ")} "${pdfPath}"`;

            printQueue.push({
                cmd,
                delayMs: PRINT_DELAY_MS
            });
        }

        console.log(
            `${copies} Druckauftrag(e) zur Queue hinzugefügt. Queue-Länge:`,
            printQueue.length
        );

        processQueue();

        res.send(`Druckauftrag (${copies} Kopien) eingereiht`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Fehler beim Drucken");
    }
});

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
