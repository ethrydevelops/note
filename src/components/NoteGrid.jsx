import { useEffect, useState } from 'preact/hooks';
import Cookies from 'universal-cookie';
import wretch from 'wretch';

export default function NoteGrid() {
    const [notes, setNotes] = useState([]);

    const cookies = new Cookies(null, { path: "/" });

    useEffect(() => {
        wretch(`${cookies.get("noteauth_hostname")}/notes`)
            .auth(`Bearer ${cookies.get("noteauth_token")}`)
            .get()
            .json((resp) => {
                if(resp.length > 0) {
                    setNotes(resp);
                }
            });
    }, []);

    return (
        <div className="note-grid">
            {notes.map((note) => (
                <div className="note-grid-item" key={note.id}>
                    <h2>{note.title}</h2>
                    <p>{note.content}</p>
                </div>
            ))}
        </div>
    );
}
