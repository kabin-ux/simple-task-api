const express = require('express');
const fs = require('fs');
const path = require('path');
const { logger } = require('./middleware/logger');
const { validateNote } = require('./middleware/validateTask');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON bodies
app.use(logger); // Custom logger middleware

// Load notes from the JSON file
const notesFilePath = path.join(__dirname, 'notes.json');

// GET /notes: Retrieve all notes
app.get('/notes', (req, res) => {
    fs.readFile(notesFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to read notes' });
        }
        const notes = JSON.parse(data);
        res.json(notes);
    });
});

// GET /notes/:id: Retrieve a specific note by ID
app.get('/notes/:id', (req, res) => {
    const noteId = req.params.id;
    fs.readFile(notesFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to read notes' });
        }
        const notes = JSON.parse(data);
        const note = notes.find(n => n.id === noteId);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json(note);
    });
});

// POST /notes: Add a new note
app.post('/notes', validateNote, (req, res) => {
    const newNote = {
        id: Date.now().toString(),
        title: req.body.title,
        content: req.body.content
    };
    fs.readFile(notesFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to read notes' });
        }
        const notes = JSON.parse(data);
        notes.push(newNote);
        fs.writeFile(notesFilePath, JSON.stringify(notes, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to save note' });
            }
            res.status(201).json(newNote);
        });
    });
});

// PUT /notes/:id: Update a specific note by ID
app.put('/notes/:id', validateNote, (req, res) => {
    const noteId = req.params.id;
    fs.readFile(notesFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to read notes' });
        }
        let notes = JSON.parse(data);
        const noteIndex = notes.findIndex(n => n.id === noteId);
        if (noteIndex === -1) {
            return res.status(404).json({ message: 'Note not found' });
        }
        notes[noteIndex] = { id: noteId, ...req.body };
        fs.writeFile(notesFilePath, JSON.stringify(notes, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to update note' });
            }
            res.json(notes[noteIndex]);
        });
    });
});

// DELETE /notes/:id: Delete a specific note by ID
app.delete('/notes/:id', (req, res) => {
    const noteId = req.params.id;
    fs.readFile(notesFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to read notes' });
        }
        let notes = JSON.parse(data);
        notes = notes.filter(n => n.id !== noteId);
        fs.writeFile(notesFilePath, JSON.stringify(notes, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to delete note' });
            }
            res.status(204).end();
        });
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
