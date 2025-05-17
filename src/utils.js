// src/utils.js
import { format } from 'date-fns';

export const APIURL = "/shijima/"; // Or "/api/shijima/" if your proxy/backend is set up like that

// Define pList and regex globally or pass as needed
const pList = [
    "i.pximg.net", "pbs.twimg.com", "sinaimg.cn", "chkaja.com",
    "inari.site", "hana-sweet.top", "p.sda1.dev",
];
let pListStr = "";
for (var i = 0; i < pList.length; i++) {
    pListStr += "|";
    pListStr += pList[i].replace(/\./g, '\\.'); // Escape dots for regex
}
const imageRegex = new RegExp(`^https://(\\w[\\w\\.]*\\.)?(${pListStr.substr(1)})/.*$`);

export const formatDateFilter = (timestamp) => {
    if (!timestamp) return '';
    try {
        const date = new Date(timestamp * 1000);
        return format(date, 'yyyy-MM-dd HH:mm:ss');
    } catch {
        return 'Invalid Date';
    }
};

export const picCheckerFilter = (url) => {
    if (!url) return "";
    // if (!imageRegex.test(url)) { // Uncomment if strict checking is needed
    //     return "/pic403.webp"; // Or a placeholder
    // }
    let newUrl = url;
    newUrl = newUrl.replace("i.pximg.net", "pximg.moonchan.xyz");
    newUrl = newUrl.replace("pbs.twimg.com", "twimg.moonchan.xyz");
    newUrl = newUrl.replace("ex.moonchan.xyz", "ehwv.moonchan.xyz/image");
    newUrl = newUrl.replace("ex.nmbyd1.top", "ehwv.moonchan.xyz/image");
    newUrl = newUrl.replace("ex.nmbyd2.top", "ehwv.moonchan.xyz/image");
    newUrl = newUrl.replace("exhentai.org", "ehwv.moonchan.xyz/image");
    newUrl = newUrl.replace("e-hentai.org", "ehwv.moonchan.xyz/image");
    return newUrl;
};

export const txtFilter = (text) => {
    if (!text) return "";
    // In React, you render <br /> tags differently or use CSS for newlines
    // For direct HTML rendering (use with caution due to XSS):
    // return { __html: text.replaceAll("\n", "<br />") };
    // For rendering within <pre> or with CSS `white-space: pre-line;`:
    return text;
};