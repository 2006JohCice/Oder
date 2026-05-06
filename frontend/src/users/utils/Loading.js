import React, { useEffect, useState } from "react";
import "../css/Loading/Loading.css";
import NoInternet from "./NoInternet";

const text = "Order Shop is loading...";

const Loading = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const goOnline = () => setIsOnline(true);
        const goOffline = () => setIsOnline(false);

        window.addEventListener("online", goOnline);
        window.addEventListener("offline", goOffline);

        return () => {
            window.removeEventListener("online", goOnline);
            window.removeEventListener("offline", goOffline);
        };
    }, []);




    const [displayText, setDisplayText] = useState("");
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < text.length) {
            const timeout = setTimeout(() => {
                setDisplayText((prev) => prev + text[index]);
                setIndex(index + 1);
            }, 60);
            return () => clearTimeout(timeout);
        } else {
            // lặp lại typing
            setTimeout(() => {
                setDisplayText("");
                setIndex(0);
            }, 1000);
        }
    }, [index]);

    return isOnline ? (
        <div className="loading-container">
            <h1 className="typing-text">
                {displayText}
                <span className="cursor">|</span>
            </h1>
        </div>
    ) : (
        <NoInternet />
    );

};

export default Loading;