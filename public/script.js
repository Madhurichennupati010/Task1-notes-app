const notesContainer = document.getElementById("notesContainer");

async function loadNotes() {

    const response = await fetch("/api/notes");

    const notes = await response.json();

    notesContainer.innerHTML = "";

    notes.forEach(note => {

        notesContainer.innerHTML += `
            <div class="note-card">

                <h3>${note.title}</h3>

                <p>${note.content}</p>

                <button onclick="deleteNote(${note.id})">
                    Delete
                </button>

            </div>
        `;

    });

}

document.getElementById("noteForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const title = document.getElementById("title").value;

    const content = document.getElementById("content").value;

    await fetch("/api/notes", {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            title,
            content

        })

    });

    document.getElementById("noteForm").reset();

    loadNotes();

});

async function deleteNote(id) {

    await fetch(`/api/notes/${id}`, {

        method: "DELETE"

    });

    loadNotes();

}

loadNotes();