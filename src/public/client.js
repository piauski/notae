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

const options = {
    headerIds: false,
    gfm: true,
    tables: true,
    breaks: true,
};

markdownEditor.addEventListener("input", () => {
    const markdownText = markdownEditor.value;
    preview.innerHTML = marked(markdownText, options);
});

noteDeleteConfirm.addEventListener("click", async () => {
    const notesToDelete = document.querySelectorAll(
        ".note-mark-for-delete[note-id]",
    );
    notesToDelete.forEach(async (note) => {
        const noteId = note.getAttribute("note-id");
        console.log(`Attempting to delete note by id: ${noteId}`);
        try {
            await axios.delete(`/api/notes/${noteId}`);
            console.log(`Successfully deleted note by id: ${noteId}`);
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

window.onload = () => {
    const markdownText = markdownEditor.value;
    preview.innerHTML = marked(markdownText, options);

    axios
        .get("/api/notes")
        .then((response) => {
            const notes = response.data;
            console.log(notes);
            notes.forEach((note) => {
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
                noteListItem.setAttribute("note-id", note.id);
                noteListItem.appendChild(noteLink);

                noteDelete.addEventListener("click", () => {
                    noteDeleteConfirmationPopupTitle.textContent = `Delete Note '${note.title}'?`;
                    noteListItem.classList.add("note-mark-for-delete");
                    noteDeleteConfirmationPopup.classList.add("show");
                });

                notesList.appendChild(noteListItem);
            });
        })
        .catch((error) => {
            console.error("Error fetching notes:", error);
        });
};
