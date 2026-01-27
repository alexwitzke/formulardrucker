pdfjsLib.GlobalWorkerOptions.workerSrc =
    "/public/pdfjs/pdf.worker.min.js";

document.querySelectorAll(".preview-row").forEach(async row => {
    const url = row.dataset.pdf;

    const pdf = await pdfjsLib.getDocument(url).promise;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);

        const viewport = page.getViewport({ scale: 0.4 });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.className = "preview-page";

        row.appendChild(canvas);

        await page.render({
            canvasContext: ctx,
            viewport
        }).promise;
    }
});

function printForm(id) {
    fetch(`/print/${id}`, { method: "POST" });
}


// pdfjsLib.GlobalWorkerOptions.workerSrc =
//     "/public/pdfjs/pdf.worker.min.js";

// document.querySelectorAll("canvas.preview").forEach(async canvas => {
//     const url = canvas.dataset.pdf;

//     const pdf = await pdfjsLib.getDocument(url).promise;
//     const page = await pdf.getPage(1);

//     const viewport = page.getViewport({ scale: 0.5 });
//     const ctx = canvas.getContext("2d");

//     canvas.width = viewport.width;
//     canvas.height = viewport.height;

//     await page.render({
//         canvasContext: ctx,
//         viewport
//     }).promise;
// });

// function printForm(id) {
//     fetch(`/print/${id}`, { method: "POST" });
// }
