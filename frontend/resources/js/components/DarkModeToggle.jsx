import { useState, useEffect } from "react";

const DarkModeToggle = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        const shouldBeDark =
            savedTheme === "dark" ||
            (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);

        document.body.classList.toggle("dark-mode", shouldBeDark);
        setIsDark(shouldBeDark);
    }, []);

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
        >
            <i className={`bi ${isDark ? "bi-sun-fill" : "bi-moon-stars-fill"}`}></i>
        </button>
    );
};

export default DarkModeToggle;
