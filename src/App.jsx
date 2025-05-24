// src/App.jsx
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from './components/Navbar.jsx'
import Menu from './Menu.tsx';
import Form from './Form.tsx';
import Threads from './Threads.tsx'
import { getCookie } from './services/api'
import { getCookie as getAuth } from './services/utils.ts';
import { setDocumentTitle } from './services/utils.ts';

function App() {
  if (getAuth("auth") === null) getCookie();

  const [_, setSearchParams] = useSearchParams();
  const [board, setBoard] = useState({ id: 1, title: "闲聊" });

  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [postFormIsOpen, setPostformIsOpen] = useState(false);
  const [title, setTitle] = useState("月岛 - 匿名版")
  const [refresh, setRefresh] = useState(0)


  // board被设置的时候
  const onSelectBoard = (board) => {
    console.log(board);
    setBoard(board);
    setSearchParams({ bid: String(board.id) })
    setTitle(`${board.name}`)
    // setTitle(`${board.name} ${board.intro ? `- ${board.intro}` : ""}`)
    setDocumentTitle(`${board.name} ${board.intro ? `- ${board.intro}` : "- 月岛"}`)
  }


  const onPostSuccess = () => {
    setRefresh(prev => prev + 1)
  }

  return <div className='bg-green h-auto w-screen'>
    <Navbar onToggleOffCanvas={() => { setMenuIsOpen(true) }} title={title} onTogglePostForm={() => { setPostformIsOpen(true) }} />

    <Threads refresh={refresh} />

    <Menu isOpen={menuIsOpen} onClose={() => { setMenuIsOpen(false) }} onSelectBoard={onSelectBoard}></Menu>
    <Form isVisible={postFormIsOpen} title={board.name} onClose={() => { setPostformIsOpen(false) }} onPostSuccess={onPostSuccess} />
  </div>

}

export default App;