import { useState } from 'preact/hooks'
import "@fontsource/inter";
import Link from './Link';

export default function NavBar(props) {
  const [count, setCount] = useState(0)

  return (
    <nav>
        <img src="/logo.svg" alt="Note logo" className="logo" onDragStart={(e) => {e.preventDefault(); return false;}} onContextMenu={(e) => {e.preventDefault(); return false;}} />

        {props.loggedIn ? 
            <div className="nav-right-elements-loggedin">
                <Link href="/app" className="nav-right-link">My Notes</Link>
                <Link href="/logout" className="nav-right-link nav-right-logout-link">Logout</Link>
            </div>
        : ""}
        
    </nav>
  )
}
