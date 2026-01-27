document.querySelectorAll(".form-row").forEach(async row => {
    const pdfUrl = row.dataset.pdf;
    const pagesContainer = row.querySelector(".pages");

    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        pagesContainer.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        page.render({ canvasContext: ctx, viewport });
    }

    const printButton = row.querySelector(".print-button");
    printButton.addEventListener("click", async () => {
        const formId = row.dataset.id;
        const res = await fetch(`/print/${formId}`, { method: "POST" });
        if (res.ok) alert("Druckauftrag gesendet");
        else alert("Fehler beim Drucken");
    });
});
