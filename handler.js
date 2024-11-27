const middy = require('@middy/core');
const { authenticate } = require('./middleware/auth');
const { getNotes, addNote, updateNote, deleteNote } = require('./functions/notes');

const getNotesHandler = async (event) => {
  const userId = event.user.email; 
  return await getNotes(userId); 
};

const addNoteHandler = async (event) => {
  const noteData = JSON.parse(event.body);
  noteData.userId = event.user.email; 
  return await addNote(noteData); 
};

const updateNoteHandler = async (event) => {
  const noteData = JSON.parse(event.body); 
  noteData.userId = event.user.email;  
  return await updateNote(noteData); 
};

const deleteNoteHandler = async (event) => {
  const { id } = event.pathParameters; 
  const userId = event.user.email; 
  return await deleteNote(id, userId);  
};

module.exports.getNotes = middy(getNotesHandler).use(authenticate());
module.exports.addNote = middy(addNoteHandler).use(authenticate());
module.exports.updateNote = middy(updateNoteHandler).use(authenticate());
module.exports.deleteNote = middy(deleteNoteHandler).use(authenticate());
