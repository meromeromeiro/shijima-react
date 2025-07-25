import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom';
import PostForm from "./components/PostForm.tsx"
import { uploadFile } from './services/upload';


export default function Form({ isVisible, onClose, onPostSuccess, title }) {
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({ name: "", email: "", title: "", content: "" });
    const [imageURL, setImageURL] = useState("");

    const onUploadFile = async (file: File) => {
        console.log(file);
        if (file) {
            setImageURL("https://media.tenor.com/WX_LDjYUrMsAAAAm/loading.webp");
            const url = await uploadFile(file);
            console.log(url);
            setImageURL(url);
        }
    }

    useEffect(() => {
        if (searchParams.has("r")) {
            setFormData(prev => {
                return {
                    ...prev,
                    content: prev.content += (">No." + searchParams.get("r") + "\n"),
                }
            })
        }
    }, [searchParams])

    return <PostForm
        isVisible={isVisible}
        onClose={onClose}
        currentBoardTitle={title}
        currentBoardId={searchParams.get("bid")}
        currentThreadId={searchParams.get("tid")}
        onPostSuccess={() => { setImageURL(""); onPostSuccess() }}
        formData={formData}
        setFormData={setFormData}
        imageURL={imageURL}
        setImageFile={onUploadFile}
        setImageURL={setImageURL}
    />
}