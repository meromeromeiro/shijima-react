import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import PostForm from "./components/PostForm"
import { uploadFile } from './services/upload';


export default function Form({ isVisible, onClose, onPostSuccess }) {
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({ name: "", email: "", title: "", content: "" });
    const [imageFile, setImageFile] = useState("");

    const onUploadFile = async (file:File) => {
        const url = await uploadFile(file);
        setImageFile(url);
    }

    return <PostForm
        isVisible={isVisible}
        onClose={onClose}
        currentBoardId={searchParams.get("bid")}
        currentThreadId={searchParams.get("tid")}
        onPostSuccess={onPostSuccess}
        formData={formData}
        setFormData={setFormData}
        imageFile={imageFile}
        setImageFile={onUploadFile}
    />
}