import React, { useState, useEffect } from 'react';
import { getBoardStructure } from './services/api.ts'
import type { Board } from './services/type';

import OffCanvasMenu from './components/OffCanvasMenu';

export default function Menu({ isOpen, onClose }) {
    const [boardStructure, setBoardStructure] = useState<Board[]>([]);
    useEffect(() => {
        getBoardStructure().then(r => setBoardStructure(r))
    }, [])

    const onSelectBoard = (item) => {
        console.log(item);
        onClose();
    }

    return <OffCanvasMenu isOpen={isOpen} onClose={onClose} boardStructure={boardStructure} onSelectBoard={onSelectBoard}/>

}