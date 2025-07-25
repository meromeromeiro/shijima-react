import { useState, useEffect } from 'react';
import { getBoardStructure } from './services/api.ts'
import type { Board } from './services/type';

import OffCanvasMenu from './components/OffCanvasMenu';
// import { useSearchParams } from 'react-router-dom';

export default function Menu({ isOpen, onClose, onSelectBoard }) {
    const [boardStructure, setBoardStructure] = useState<Board[]>([]);
    // const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        getBoardStructure().then(r => setBoardStructure(r))
    }, [])

    return <OffCanvasMenu isOpen={isOpen} onClose={onClose} boardStructure={boardStructure} onSelectBoard={(item) => { onSelectBoard(item); onClose(); }} />

}