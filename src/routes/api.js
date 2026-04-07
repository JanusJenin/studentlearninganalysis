const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { PDFDocument, rgb } = require('pdf-lib');
const db = require('../data/mockDb');

// Ensure uploads directory exists (important on cloud platforms)
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer for file uploads with absolute path
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// --- Authentication ---
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true, user: { id: user.id, role: user.role, name: user.name } });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// --- Data Routes ---
router.get('/users', (req, res) => {
    const filteredUsers = db.users.filter(u => u.role !== 'admin').map(u => ({ id: u.id, name: u.name, role: u.role }));
    res.json(filteredUsers);
});

router.get('/students', (req, res) => {
    const students = db.users.filter(u => u.role === 'student');
    const enriched = students.map(s => {
        const log = db.learningLogs.find(l => l.studentId === s.id);
        return { ...s, log };
    });
    res.json(enriched);
});

router.get('/materials', (req, res) => {
    res.json(db.materials);
});

// --- Generate Material PDF On The Fly ---
router.get('/materials/:id/download', async (req, res) => {
    const id = parseInt(req.params.id);
    const material = db.materials.find(m => m.id === id);
    if (!material) return res.status(404).send('Not Found');

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    // Header Bar
    page.drawRectangle({ x: 0, y: height - 60, width: width, height: 60, color: rgb(0.145, 0.388, 0.921) });
    page.drawText(`SLPCT Study Material Engine`, { x: 40, y: height - 38, size: 20, color: rgb(1, 1, 1) });

    // Title
    page.drawText(material.title, { x: 40, y: height - 120, size: 24, color: rgb(0.1, 0.1, 0.1) });

    // Description Divider
    page.drawLine({ start: { x: 40, y: height - 135 }, end: { x: width - 40, y: height - 135 }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });

    // Content body
    page.drawText(material.description, { x: 40, y: height - 165, size: 14, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(`Official curriculum content for: ${material.title}`, { x: 40, y: height - 200, size: 12, color: rgb(0.4, 0.4, 0.4) });

    // Footer
    page.drawText(`Generated via SLPCT System`, { x: width / 2 - 80, y: 40, size: 10, color: rgb(0.6, 0.6, 0.6) });

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${material.title.replace(/\s+/g, '_')}.pdf"`);
    res.send(Buffer.from(pdfBytes));
});

// --- Assignment Submission ---
router.post('/assignments/upload', upload.single('assignment'), async (req, res) => {
    const studentId = parseInt(req.body.studentId);
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(dataBuffer);
        const text = data.text.toLowerCase();

        if (!text.includes('assignment')) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Error: doc reupload' });
        }

        const newAssignment = {
            id: db.assignments.length + 1,
            studentId,
            fileUrl: `/uploads/${req.file.filename}`,
            filename: req.file.originalname,
            status: 'submitted',
            grade: null
        };
        db.assignments.push(newAssignment);
        db.save();
        res.json({ success: true, assignment: newAssignment });
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(500).json({ success: false, message: 'Error parsing document' });
    }
});

router.get('/assignments', (req, res) => {
    const enriched = db.assignments.map(a => {
        const student = db.users.find(u => u.id === a.studentId);
        return { ...a, studentName: student ? student.name : 'Unknown' };
    });
    res.json(enriched);
});

// --- Machine Learning Alerts Mock ---
router.get('/alerts', (req, res) => {
    const inconsistentLogs = db.learningLogs.filter(l => l.pattern.includes('Inconsistent'));
    const alerts = inconsistentLogs.map(l => {
        const student = db.users.find(u => u.id === l.studentId);
        return {
            studentId: l.studentId,
            studentName: student.name,
            message: `Warning: ${student.name} shows sudden drop in engagement (Logins: ${l.logins}, Avg Quiz: ${l.avgQuizScore}).`,
            severity: 'High'
        };
    });
    res.json(alerts);
});

module.exports = router;
