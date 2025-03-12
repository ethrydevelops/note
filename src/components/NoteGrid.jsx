import { useEffect, useState } from 'preact/hooks';
import Cookies from 'universal-cookie';
import wretch from 'wretch';
import Modal from './Modal';
import socket from '../socket';

/* this might be the worst code ive written in my life */

export default function NoteGrid() {
    const [notes, setNotes] = useState([]);
    const [noteModalContents, setNoteModalContents] = useState({title:"loading", content: "loading"});
    const [noteModalId, setNoteModalId] = useState("loading");

    const [noteModalEditedToTitle, setNoteModalEditedToTitle] = useState("");
    const [noteModalEditedToContent, setNoteModalEditedToContent] = useState("");

    const [modalTipClass, setModalTipClass] = useState("text-danger");
    const [modalTip, setModalTip] = useState("Error");

    const [deleteModalNoteName, setDeleteModalNoteName] = useState("");

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

    /* socket get note changes and reflect */
    useEffect(() => {
        socket.on("noteListUpdate", (ok) => {
            console.log("Syncing note list");
            refreshNotes(); // note list update signalled
        });

        return () => {
            socket.off("noteListUpdate");
        };
    }, []);

    /* modals */

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true); // note preview modal
    const closeModal = () => setIsModalOpen(false); // note preview modal

    const [secondDeleteModalOpened, setSecondDeleteModalOpened] = useState(false);
    const openSingleNoteDeleteModal = (noteId) => {
        setDeleteModalNoteName("Loading");

        wretch(`${cookies.get("noteauth_hostname")}/notes/${noteId}`)
            .auth(`Bearer ${cookies.get("noteauth_token")}`)
            .get()
            .json((resp) => {
                setDeleteModalNoteName(resp.title)
                setSecondDeleteModalOpened(true);
            });
    }

    const closeSingleNoteDeleteModal = () => {
        setSecondDeleteModalOpened(false);
    }

    const deleteSingleNote = (id) => {
        wretch(`${cookies.get("noteauth_hostname")}/notes/${id}`)
            .auth(`Bearer ${cookies.get("noteauth_token")}`)
            .delete()
            .json((resp) => {
                closeModal();
                refreshNotes();

                setSecondDeleteModalOpened(false);
            });
    }

    const modalSet = (id) => {
        // TODO: update live w/ websockets

        setNoteModalId(id);
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
                    <h2 className="note-modal-title m-0 p-0 note-modal-input-element-either" aria-labelledby="note-edit-modal-title" tabIndex={0} contentEditable={true} spellCheck={true} onInput={(e) => {setNoteModalEditedToTitle(e.target.innerText)}} placeholder="Title">{noteModalContents.title.trim()}</h2>

                    <label id="note-edit-modal-contents" class="sr-only">Note contents</label>
                    <p className="m-0 p-0 note-modal-input-element-either note-modal-input-content" aria-labelledby="note-edit-modal-contents" tabIndex={0} contentEditable={true} spellCheck={true} onInput={(e) => {setNoteModalEditedToContent(e.target.innerText)}} placeholder="Your note goes here...">{noteModalContents.content.trim()}</p>

                    <div className="note-modal-buttons">
                        <div>
                            <button className="note-modal-delete-button" aria-label="Delete this note" onClick={(e) => {openSingleNoteDeleteModal(noteModalId);}}>
                                <i class="bi bi-trash-fill"></i>
                                </button>
                        </div>

                        <div className="note-modal-buttons-end">
                            <span className={modalTipClass}>{modalTip}</span>
                            <button className="btn btn-primary">Save</button>
                        </div>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={secondDeleteModalOpened} closeModal={closeSingleNoteDeleteModal}>
                <h1 className="m-0 p-0">Delete '{deleteModalNoteName}'?</h1>
                <p className="m-0 p-0">Are you sure you want to permanently delete <b>{deleteModalNoteName}</b>?</p>

                <div className="flex-things-centered">
                    <div className="flex-delete-buttons">
                        <button className="btn btn-danger" onClick={(e) => {deleteSingleNote(noteModalId)}}>Delete Note</button>
                        <button className="btn btn-secondary" onClick={closeSingleNoteDeleteModal}>Cancel</button>
                    </div>
                </div>
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
