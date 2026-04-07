const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');

async function createPDF(filename, text) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText(text, { x: 50, y: 700, size: 24, color: rgb(0, 0, 0) });
    const pdfBytes = await pdfDoc.save();
    // Save to the root of the vishnu folder for easy access
    fs.writeFileSync(`../${filename}`, pdfBytes);
}

async function run() {
    await createPDF('Demo_Assignment_Valid.pdf', 'This is my final Assignment for the semester.');
    await createPDF('Math_Assignment_Valid.pdf', 'Math Assignment Part 1. 2 + 2 = 4');
    await createPDF('Random_Unrelated_Doc.pdf', 'This is just a grocery list. Nothing else.');
    console.log('Demos created');
}

run();
