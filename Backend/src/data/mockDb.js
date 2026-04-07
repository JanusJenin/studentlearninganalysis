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
        console.error("Error reading db.json", e);
    }
}

// Attach a save mechanism directly to the structure!
// So when api.js pushes to db.assignments, it can call db.save() to persist.
dbData.save = function() {
    try {
        // We do not want to serialize the 'save' function itself into the JSON
        const snapshot = {
            users: this.users,
            materials: this.materials,
            assignments: this.assignments,
            learningLogs: this.learningLogs
        };
        fs.writeFileSync(dbPath, JSON.stringify(snapshot, null, 2), 'utf-8');
    } catch (e) {
        console.error("Error writing to database.json", e);
    }
};

module.exports = dbData;
