import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

const markdownEditor = document.getElementById("markdown-editor");
const preview = document.getElementById("markdown-preview");

markdownEditor.addEventListener("input", () => {
    const markdownText = markdownEditor.value;
    preview.innerHTML = marked(markdownText, options);
});

window.onload = () => {
    const markdownText = markdownEditor.value;
    preview.innerHTML = marked(markdownText,  options);
}
