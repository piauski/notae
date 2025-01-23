import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

const markdownEditor = document.getElementById("markdown-editor");
const preview = document.getElementById("markdown-preview");

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

window.onload = () => {
    const markdownText = markdownEditor.value;
    preview.innerHTML = marked(markdownText,  options);
}
