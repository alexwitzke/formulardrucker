const printer = require("pdf-to-printer");

async function printPDF(filePath, printerName, duplex = false) {
  try {
    await printer.print(filePath, {
      printer: printerName,
      duplex: duplex
    });
    console.log(`Druckauftrag gesendet: ${filePath}`);
  } catch (err) {
    console.error("Fehler beim Drucken:", err);
  }
}

module.exports = { printPDF };
