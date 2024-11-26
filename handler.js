const { getNotes, addNote, updateNote, deleteNote } = require('./handlers/notes');

module.exports.getNotes = getNotes;
module.exports.addNote = addNote;
module.exports.updateNote = updateNote;
module.exports.deleteNote = deleteNote;