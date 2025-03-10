import { useEffect, useState } from 'preact/hooks';
import Cookies from 'universal-cookie';
import wretch from 'wretch';
import Modal from './Modal';

export default function NoteGrid() {
    const [notes, setNotes] = useState([]);
    const [noteModalContents, setNoteModalContents] = useState({title:"loading", content: "loading"});

    const [noteModalEditedToTitle, setNoteModalEditedToTitle] = useState("");
    const [noteModalEditedToContent, setNoteModalEditedToContent] = useState("");

    const [modalTipClass, setModalTipClass] = useState("text-danger");
    const [modalTip, setModalTip] = useState("Error");

    const cookies = new Cookies(null, { path: "/" });

    const refreshNotes = () => {
        wretch(`${cookies.get("noteauth_hostname")}/notes`)
            .auth(`Bearer ${cookies.get("noteauth_token")}`)
            .get()
            .json((resp) => {
                if(resp.length > 0) {
                    setNotes(resp);
                }
            });
    }

    useEffect(() => {
        refreshNotes();
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const modalSet = (id) => {
        // TODO: update live w/ websockets
        wretch(`${cookies.get("noteauth_hostname")}/notes/${id}`)
            .auth(`Bearer ${cookies.get("noteauth_token")}`)
            .get()
            .json((resp) => {
                setNoteModalContents(resp);

                setModalTipClass("text-danger");
                setModalTip("");

                setNoteModalEditedToTitle(resp.title);
                setNoteModalEditedToContent(resp.content);

                // open modal only once loaded
                openModal();
            });
    }

    const updateNote = (e) => {
        e.preventDefault();
    
        const cookies = new Cookies(null, { path: '/' });
    
        wretch(`${cookies.get('noteauth_hostname')}/notes/${noteModalContents.id}`)
          .auth(`Bearer ${cookies.get('noteauth_token')}`)
          .put({ title: noteModalEditedToTitle, content: noteModalEditedToContent })
          .res(async (response) => { 
            const resp = await response.json();
            if(resp.success && resp.success === true) {
                setModalTipClass("text-success");
                setModalTip("Saved!");
            }
          })
          .catch(async (error) => {
            setModalTipClass("text-danger");
            setModalTip("Error, check console");

            console.error(error);
          });

        setTimeout(() => {
            refreshNotes();
        }, 100);
    }

    return (
        <section>
            <Modal isOpen={isModalOpen} closeModal={closeModal}>
                <form onSubmit={updateNote}>
                    <label id="note-edit-modal-title" class="sr-only">Note title</label>
                    <h2 className="note-modal-title m-0 p-0 note-modal-input-element-either" aria-labelledby="note-edit-modal-title" tabIndex={0} contentEditable={true} spellCheck={true} onInput={(e) => {setNoteModalEditedToTitle(e.target.innerText)}}>{noteModalContents.title}</h2>

                    <label id="note-edit-modal-contents" class="sr-only">Note contents</label>
                    <p className="m-0 p-0 note-modal-input-element-either" aria-labelledby="note-edit-modal-contents" tabIndex={0} contentEditable={true} spellCheck={true} onInput={(e) => {setNoteModalEditedToContent(e.target.innerText)}}>
                        {noteModalContents.content}
                    </p>

                    <div className="note-modal-buttons-end">
                        <span className={modalTipClass}>{modalTip}</span>
                        <button className="btn btn-primary">Save</button>
                    </div>
                </form>
            </Modal>

            <div className="note-grid">
                {notes.map((note) => (
                    <div className="note-grid-item" onClick={(e) => {modalSet(note.id)}} key={note.id} tabIndex={0}>
                        <h2>{note.title}</h2>
                        <p className="note-grid-paragraph">{note.content}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
