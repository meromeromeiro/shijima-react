import React, { useState, useEffect } from 'react';
import { APIURL } from '../utils';

function Header({ userId, userAuth, onSetUser, onClearUser }) {
    const [isCookieButtonAbled, setIsCookieButtonAbled] = useState(true);

    const getID = async () => {
        setIsCookieButtonAbled(false);
        try {
            const response = await fetch(APIURL + "cookie");
            const data = await response.json();
            if (data.id && data.auth) {
                localStorage.setItem('id', data.id);
                localStorage.setItem('auth', data.auth);
                onSetUser(data.id, data.auth);
            }
        } catch (error) {
            console.error("Error fetching cookie:", error);
        } finally {
            setIsCookieButtonAbled(true);
        }
    };

    const deleteID = () => {
        localStorage.removeItem('id');
        localStorage.removeItem('auth');
        onClearUser();
    };

    return (
        <header className="bg-shijima-dark-gray text-shijima-ivory p-3 text-sm">
            <div className="container mx-auto flex justify-between items-center">
                <div className="space-x-2">
                    <a href="/site.html" className="text-shijima-ivory hover:underline">nyaa镜像地址</a>|
                    <a href="/xjb.html" className="text-shijima-ivory hover:underline">瞎几把导航</a>|
                    <a href="https://g.moonchan.xyz/blacksheepwall" className="text-shijima-ivory hover:underline">google镜像</a>|
                    <a href="https://scholar.moonchan.xyz/" className="text-shijima-ivory hover:underline">google学术</a>|
                    <span>
                        <a href="https://xxxxxxx.showtheoldmanthedoor.ml/" className="text-shijima-ivory hover:underline">别的什么岛</a>
                        (<a href="https://damedesu.1145141919810.org/" className="text-shijima-ivory hover:underline">啊——</a>)
                    </span>|
                    <a href="https://chat.moonchan.xyz/" className="text-shijima-ivory hover:underline">chat</a>
                </div>
                <div>
                    {userId ? (
                        <span>
                            ID:{userId} <button onClick={deleteID} className="text-shijima-ivory hover:underline ml-2 bg-transparent border-none cursor-pointer">销毁饼干</button>
                        </span>
                    ) : (
                        <button onClick={getID} disabled={!isCookieButtonAbled} className="text-shijima-ivory hover:underline bg-transparent border-none cursor-pointer disabled:opacity-50">
                            点击获取饼干
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;