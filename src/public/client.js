import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

const markdownEditor = document.getElementById("markdown-editor");
const preview = document.getElementById("markdown-preview");
const notesList = document.getElementById("notes-list");

const noteDeleteConfirmationPopup = document.getElementById(
    "note-delete-confirmation-popup",
);
const noteDeleteConfirmationPopupTitle = document.getElementById(
    "note-delete-confirmation-popup-title",
);
const noteDeleteConfirm = document.getElementById("note-delete-confirm");
const noteDeleteCancel = document.getElementById("note-delete-cancel");

const noteNew = document.getElementById("note-new");
const darkModeSwitch = document.getElementById("dark-mode-switch");

const options = {
    headerIds: false,
    gfm: true,
    tables: true,
    breaks: true,
};

function updateMarkdownPreview() {
    const markdownText = markdownEditor.value;
    preview.innerHTML = marked(markdownText, options);
}

let timeoutId;

// TODO: Reorder note list by most recently updated.
function updateNoteContentById(id, content, force = false) {
    if (force) {
        clearTimeout(timeoutId);
        sendUpdateRequest(id, content);
    } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            sendUpdateRequest(id, content);
        }, 500);
    }
}

function sendUpdateRequest(id, content) {
    axios
        .patch(`/api/notes/${id}`, { content: content })
        .then((response) => {
            const note = response.data;
            console.log("Note updated successfully: ", note);
            const noteEntry = document.querySelector(
                `.note-entry[data-note-id="${note.id}"]`,
            );
            const noteTitle = noteEntry.querySelector(".note-title");
            const noteDate = noteEntry.querySelector(".note-date");
            noteTitle.textContent = note.title;
            noteDate.textContent = `Updated: ${note.updated_at}`;
        })
        .catch((error) => {
            console.error("Error updating note:", error);
        });
}

markdownEditor.addEventListener("input", () => {
    const currentNoteId = markdownEditor.getAttribute("data-current-note-id");
    if (currentNoteId) {
        updateMarkdownPreview();
        updateNoteContentById(
            markdownEditor.getAttribute("data-current-note-id"),
            markdownEditor.value,
        );
    } else {
        // TODO: create new note or default to note on top of list.
        // For now, disable the editor.
        markdownEditor.disabled = true;
        markdownEditor.placeholder = "Select a note...";
    }
});

function createNoteListEntry(note) {
    const noteLink = document.createElement("a");
    noteLink.href = "#";
    noteLink.classList.add("note-link");

    const noteTitle = document.createElement("h2");
    noteTitle.classList.add("note-title");
    noteTitle.textContent = note.title;

    const noteDate = document.createElement("p");
    noteDate.classList.add("note-date");
    noteDate.textContent = `Updated: ${note.updated_at}`;

    const noteDelete = document.createElement("button");
    noteDelete.classList.add("note-delete");
    noteDelete.textContent = "🗑️ Delete";

    noteLink.appendChild(noteTitle);
    noteLink.appendChild(noteDate);
    noteLink.appendChild(noteDelete);

    const noteListItem = document.createElement("li");
    noteListItem.classList.add("note-entry");
    noteListItem.setAttribute("data-note-id", note.id);
    noteListItem.appendChild(noteLink);

    noteLink.addEventListener("click", async () => {
        // FIXME: This seems to crash the entire server. Must be the
        // way I get the noteId or something?
        // Save current note content.
        /*const currentNote =  markdownEditor.getAttribute("data-current-note-id");
        if (currentNote) {
            console.log("Saving current note content");
        updateNoteContentById(
            currentNote,
            markdownEditor.value,
            true,
        );
        }*/
        const selectedNotes = document.querySelectorAll(".note-selected");
        for (const selectedNote of selectedNotes) {
            selectedNote.classList.remove("note-selected");
        }
        noteLink.classList.add("note-selected");
        // Get clicked note content and update the preview.
        axios
            .get(`/api/notes/${note.id}`)
            .then((response) => {
                const newNote = response.data;
                markdownEditor.disabled = false;
                markdownEditor.placeholder = "Write your note here...";
                markdownEditor.value = newNote.content;
                markdownEditor.setAttribute("data-current-note-id", newNote.id);
                updateMarkdownPreview();
                updateNoteContentById(newNote.id, newNote.content);
            })
            .catch((error) => {
                console.error("Error retrieving note: ", error);
            });
    });

    noteDelete.addEventListener("click", () => {
        noteDeleteConfirmationPopupTitle.textContent = note.title == '' ? 'Delete Empty Note?' : `Delete Note '${note.title}'?`;
        noteListItem.classList.add("note-mark-for-delete");
        noteDeleteConfirmationPopup.classList.add("show");
    });

    notesList.prepend(noteListItem);
}

// TODO: style this button
noteNew.addEventListener("click", async () => {
    try {
        const response = await axios.post("/api/notes/new", { content: "" });

        const createdNote = response.data;
        console.log("Successfully created new note: ", createdNote);

        createNoteListEntry(createdNote);
    } catch (error) {
        console.error("Error creating note: ", error);
    }
});

// FIXME: Sometimes the server gets 500'd and crashes.
noteDeleteConfirm.addEventListener("click", async () => {
    const notesToDelete = document.querySelectorAll(
        ".note-mark-for-delete[data-note-id]",
    );
    notesToDelete.forEach(async (note) => {
        const noteId = note.getAttribute("data-note-id");
        try {
            await axios.delete(`/api/notes/${noteId}`);
            console.log(`Successfully deleted note by id: ${noteId}`);
            
            markdownEditor.setAttribute("data-current-note-id", null);
            markdownEditor.value = "";
            markdownEditor.disabled = true;
            markdownEditor.placeholder = "Select a note...";
            updateMarkdownPreview();
            
            note.parentNode.removeChild(note);
            noteDeleteConfirmationPopup.classList.remove("show");
        } catch (error) {
            console.error("Error deleting note: ", error);
        }
    });
});

noteDeleteCancel.addEventListener("click", () => {
    noteDeleteConfirmationPopup.classList.remove("show");
});

darkModeSwitch.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
        darkModeSwitch.textContent = "☀️";
    } else {
        darkModeSwitch.textContent = "🌙";
    }
});

window.onload = () => {
    markdownEditor.value = "";
    markdownEditor.disabled = true;
    markdownEditor.placeholder = "Select a note...";
    updateMarkdownPreview();
    
    axios
        .get("/api/notes")
        .then((response) => {
            const notes = response.data;
            notes.forEach(createNoteListEntry);
        })
        .catch((error) => {
            console.error("Error fetching notes:", error);
        });
};
