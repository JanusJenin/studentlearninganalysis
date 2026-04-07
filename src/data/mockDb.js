const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');

// Initial load
let dbData = {
    users: [],
    materials: [],
    assignments: [],
    learningLogs: []
};

if (fs.existsSync(dbPath)) {
    try {
        const raw = fs.readFileSync(dbPath, 'utf-8');
        dbData = JSON.parse(raw);
    } catch (e) {
        console.error("Error reading database.json", e);
    }
}

// Attach a save mechanism directly to the structure
dbData.save = function() {
    try {
        const snapshot = {
            users: this.users,
            materials: this.materials,
            assignments: this.assignments,
            learningLogs: this.learningLogs
        };
        fs.writeFileSync(dbPath, JSON.stringify(snapshot, null, 2), 'utf-8');
    } catch (e) {
        console.error("Error writing to database.json:", e);
    }
};

module.exports = dbData;
