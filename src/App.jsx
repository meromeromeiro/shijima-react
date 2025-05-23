// src/App.jsx
import { useState } from 'react';
import Navbar from './components/Navbar.jsx'
import Menu from './Menu.tsx';
import  Form  from './Form.tsx';

function App() {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [postFormIsOpen, setPostformIsOpen] = useState(false);
  const [title, setTitle] = useState("月岛 - 匿名版")

  const onPostSuccess = () => {
    console.log("success")
    setTitle(prev => prev+"1");
  }

  return <div className='bg-green h-screen w-screen'>
    <Navbar onToggleOffCanvas={() => { setMenuIsOpen(true) }} title={title} onTogglePostForm={() => { setPostformIsOpen(true) }} />
    <Menu isOpen={menuIsOpen} onClose={() => { setMenuIsOpen(false) }}></Menu>
    <Form isVisible={postFormIsOpen} onClose={() => {setPostformIsOpen(false)}} onPostSuccess={onPostSuccess}/>
  </div>

}

export default App;