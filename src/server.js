const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

const CONFIG_PATH = "/data/config.json"; // Docker-Volume

// Statische Dateien
app.use("/static", express.static(path.join(__dirname, "../public")));
app.use("/pdfs", express.static("/data/pdfs"));

// Startseite
app.get("/", (req, res) => {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    res.render("index", { forms: config.forms });
});

// Druck-Route
app.post("/print/:id", (req, res) => {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    const form = config.forms.find(f => f.id === req.params.id);
    if (!form) return res.status(404).send("Formular nicht gefunden");

    const filePath = path.join("/data/pdfs", form.file);

    // lp Optionen
    const options = [];
    if (form.duplex) options.push("-o sides=two-sided-long-edge");
    //if (form.copies) options.push(`-n ${form.copies}`);

    const cmd = `lp -d ${config.printer} ${options.join(" ")} "${filePath}"`;

    //console.log(cmd);

    exec(cmd, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return res.status(500).send(stderr || err.message);
        }
        res.send("Druckauftrag erfolgreich gesendet");
    });
});

app.listen(3000, () => console.log("Server läuft auf Port 3000"));


// const express = require("express");
// const path = require("path");
// const app = express();
// //const { exec } = require("child_process");
// const { printPDF } = require("./printer"); // Modul aus Schritt 2

// app.set("view engine", "pug");
// app.set("views", path.join(__dirname, "views")); // src/views

// console.log(__dirname);
// const dataPath = path.join(__dirname, "../data/pdfs");
// console.log(dataPath);


// // Statische Assets aus public/
// app.use("/static", express.static(path.join(__dirname, "../public")));

// // PDFs aus Volume
// app.use("/pdfs", express.static(path.join(__dirname, "../data/pdfs")));

// function printPDFWindows(filePath, printerName) {
//   // Windows-Pfade doppelt escapen
//   const psFilePath = filePath.replace(/\\/g, "\\\\");
//   const cmd = `powershell -Command "Start-Process -FilePath '${psFilePath}' -Verb PrintTo -ArgumentList '${printerName}'"`;

//   const { exec } = require("child_process");
//   exec(cmd, (err, stdout, stderr) => {
//     if (err) console.error("Fehler beim Drucken:", stderr || err.message);
//     else console.log("Druckauftrag gesendet:", stdout);
//   });
// }


// // function printPDFWindows(filePath, printerName) {
// //     // Windows-Pfade doppelt escapen
// //     const psFilePath = filePath.replace(/\\/g, "//");
// //     const filePath1 = path.join(dataPath, psFilePath);
// //     console.log("Drucke Datei:", filePath1);
// //     // const cmd = `powershell -Command "Start-Process -FilePath '${filePath1}' -Verb PrintTo -ArgumentList '${printerName}'"`;

// //     // console.log(cmd);

// //     // exec(cmd, (err, stdout, stderr) => {
// //     //     if (err) {
// //     //         console.error("Fehler beim Drucken:", stderr || err.message);
// //     //         return;
// //     //     }
// //     //     console.log("Druckauftrag gesendet:", stdout);
// //     // });

// //     printer.print(filePath1, {
// //         printer: printerName,
// //         duplex: form.duplex
// //     }).then(() => console.log("Druckauftrag gesendet"))
// //         .catch(err => console.error(err));
// // }

// // config.json aus Volume
// const fs = require("fs");
// const CONFIG_PATH = process.env.CONFIG_PATH || path.join(__dirname, "../data/config.json");
// //const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

// app.get("/", (req, res) => {
//     const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
//     res.render("index", { forms: config.forms });
// });

// app.post("/print/:id", async (req, res) => {
//   try {
//     const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
//     const form = config.forms.find(f => f.id === req.params.id);
//     if (!form) return res.status(404).send("Formular nicht gefunden");
//     const psFilePath = form.file;

//     const filePath = path.join(dataPath, psFilePath);

//     console.log("Drucke Datei:", filePath);
//     const printerName = "HP 2015DN A4 Duplex"; // Windows Druckername

//     await printPDF(filePath, printerName, form.duplex); // duplex aus config.json

//     res.send("Druckauftrag gesendet");
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Fehler beim Drucken");
//   }
// });

// // app.post("/print/:id", (req, res) => {
// //     const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
// //     const form = config.forms.find(f => f.id === req.params.id);
// //     if (!form) return res.status(404).send("Formular nicht gefunden");

// //     const filePath = path.join(config.basePath, form.file);

// //     // Druckoptionen setzen
// //     const options = [];
// //     options.push(`-o sides=${form.duplex ? "two-sided-long-edge" : "one-sided"}`);

// //     const cmd = [
// //         "lp",
// //         "-d", config.printer,
// //         ...options,
// //         `"${filePath}"`
// //     ].join(" ");

// //     const { exec } = require("child_process");
// //     exec(cmd, (err, stdout, stderr) => {
// //         if (err) {
// //             console.error(err);
// //             return res.status(500).send(stderr || err.message);
// //         }
// //         res.send("Druckauftrag erfolgreich gesendet");
// //     });
// // });

// app.listen(3000);
// console.log("Server läuft auf http://localhost:3000");