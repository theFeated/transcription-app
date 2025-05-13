import { useState, useEffect } from "react";

const DarkModeToggle = () => {
    const [isDark, setIsDark] = useState(false);

    // Set theme based on localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);

        document.body.classList.toggle("dark-mode", shouldBeDark);
        setIsDark(shouldBeDark);
    }, []);

    // Listen for changes from other tabs
    useEffect(() => {
        const syncThemeAcrossTabs = (e) => {
            if (e.key === "theme") {
                const dark = e.newValue === "dark";
                document.body.classList.toggle("dark-mode", dark);
                setIsDark(dark);
            }
        };
        window.addEventListener("storage", syncThemeAcrossTabs);
        return () => window.removeEventListener("storage", syncThemeAcrossTabs);
    }, []);

    // Keyboard shortcut: Ctrl + Shift + D
    useEffect(() => {
        const handleKeyToggle = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d") {
                toggleDarkMode();
            }
        };
        window.addEventListener("keydown", handleKeyToggle);
        return () => window.removeEventListener("keydown", handleKeyToggle);
    }, [isDark]);

    const toggleDarkMode = () => {
        const newDark = !isDark;
        setIsDark(newDark);
        document.body.classList.toggle("dark-mode", newDark);
        localStorage.setItem("theme", newDark ? "dark" : "light");
    };

    return (
        <button
            onClick={toggleDarkMode}
            className="btn btn-outline-light btn-sm d-flex align-items-center"
            aria-label="Toggle dark mode"
            title="Toggle Dark Mode (Ctrl+Shift+D)"
        >
            <i className={`bi ${isDark ? "bi-sun-fill" : "bi-moon-stars-fill"}`}></i>
        </button>
    );
};

export default DarkModeToggle;
