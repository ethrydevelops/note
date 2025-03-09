import { useEffect, useState } from 'preact/hooks'
import "@fontsource/inter";
import NavBar from './components/navbar';
import wretch from 'wretch';
import Cookies from 'universal-cookie';
import NoteGrid from './components/NoteGrid';
import Footer from './components/Footer';

export default function Home() {
  const [greeting, setGreeting] = useState("Hello")
  const [noteTakingDivDemoShown, setNoteTakingDivDemoShown] = useState(true);

  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteCreationError, setNewNoteCreationError] = useState("");

  useEffect(() => {
    function getGreeting() {
      const hours = new Date().getHours();
  
      if (hours >= 5 && hours < 12) {
          return "Good Morning";
      } else if (hours >= 12 && hours < 18) {
          return "Hello";
      } else {
          return "Good Evening";
      }
    }

    setGreeting(getGreeting());
  })

  const takeNote = (e) => {
    e.preventDefault();

    const cookies = new Cookies(null, { path: '/' });

    wretch(`${cookies.get('noteauth_hostname')}/notes`)
      .auth(`Bearer ${cookies.get('noteauth_token')}`)
      .post({ title: newNoteTitle, content: newNoteContent })
      .res(async (response) => { 
        const resp = await response.json();
        if(resp.success && resp.success === true) {
          setNewNoteTitle("");
          setNewNoteContent("");
          setNewNoteCreationError("");

          document.querySelector("#new-note-title-input").value = "";
          document.querySelector("#noteTakerInput").innerText = "";

          swapWithNoteTaker();
        }
      })
      .catch(async (error) => {
        if(await error.response && await error.response.json() && await error.response.json().error) {
          setNewNoteCreationError(error.response.json().error);
        } else {
          setNewNoteCreationError("Error creating note, check console for details"); 
        }

        console.error("Error creating note", error);
      });
  }

  const swapWithNoteTaker = async () => {
    setNoteTakingDivDemoShown(!noteTakingDivDemoShown);

    await new Promise(resolve => setTimeout(resolve, 10));

    document.querySelector(".actualNoteTakingDiv").classList.add("actualNoteTakingDivHeightTwo");
    document.querySelector(".actualNoteTakingDiv").classList.remove("sizeRestrictionForDemo");
    
    document.querySelector("#noteTakerInput").focus();

    await new Promise(resolve => setTimeout(resolve, 300));

    /* animation */
    document.querySelector(".actualNoteTakingDiv").classList.remove("actualNoteTakingDivHeightTwo");
  }

  const getNewNoteContentLengthTxt = () => {
    if(newNoteContent.length >= 1980) {
      return { class: "text-danger", content: (2000 - newNoteContent.length) };
    }

    if(newNoteContent.length >= 1950) {
      return { class: "text-warning", content: (2000 - newNoteContent.length) };
    }

    if(newNoteContent.length >= 1900) {
      return { class: "", content: (2000 - newNoteContent.length) };
    }

    return { class: "", content: "" };
  }

  return (
    <div className="layout">
      <NavBar loggedIn={true} />

      {/* decided against this for now: <div className="container">
        <h1>{greeting}, Tim.</h1>
      </div>*/}

      <div className="takeanote">
        <form onSubmit={takeNote}>
          {/* original, non-editable input */}
          <div className={"noteTakingDiv noteTakingDivDemo sizeRestrictionForDemo" + (noteTakingDivDemoShown ? "" : " d-none")} tabIndex={1} contentEditable="true" onClick={(e) => {swapWithNoteTaker()}} onKeyDown={(e) => {e.preventDefault(); swapWithNoteTaker(); return false;}}>
            <span className="noteTakingDivDemoTxt">Take a note...</span>
          </div>

          {/* editable input */}
          <div className={"actualNoteTakingDiv sizeRestrictionForDemo noteTakingDiv" + (noteTakingDivDemoShown ? " d-none" : "")} tabIndex={1}>
            <input type="text" name="new-note-title-input" className="new-note-title-input" id="new-note-title-input" placeholder="Title" aria-label="Set a title for this note" maxLength="50" onInput={(e) => {setNewNoteTitle(e.target.value)}} /> 

            <div id="noteTakerInput" class="new-note-taker-input" contentEditable="true" placeholder="Take a note..." aria-label="Take a note..." onInput={(e) => { if(e.target.innerText.length > 2000){e.preventDefault(); e.target.innerText = newNoteContent; return false;} setNewNoteContent(e.target.innerText); }}></div> 

            <div className="notetaker-bottom-flex">
              <p className="m-0 p-0 mv-auto text-danger">{newNoteCreationError}</p>

              <p className={"m-0 p-0 mv-auto new-note-content-length-text " + getNewNoteContentLengthTxt().class}>{getNewNoteContentLengthTxt().content}</p>
              
              <button className="btn btn-primary" type="submit">Save</button>
            </div>
          </div>
        </form>
      </div>

      <div className="container">
        <div className="home-note-grid">
          <NoteGrid />
        </div>
      </div>
      
      <Footer></Footer>
    </div>
  )
}
