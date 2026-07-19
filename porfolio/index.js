"use strict";

/* =========================================================
   1. CONFIGURATION
========================================================= */

const DEFAULT_LANGUAGE = "fr";
const AVAILABLE_LANGUAGES = ["fr", "en", "zh"];

const LANGUAGE_LABELS = {
    fr: "FR",
    en: "EN",
    zh: "中文"
};


/* =========================================================
   2. ELEMENTS DU DOM
========================================================= */

const pageLoader = document.getElementById("pageLoader");
const siteHeader = document.getElementById("siteHeader");

const menuToggle = document.getElementById("menuToggle");
const navigationMenu = document.getElementById("navigationMenu");

const languageButton = document.getElementById("languageButton");
const languageMenu = document.getElementById("languageMenu");
const currentLanguageCode = document.getElementById(
    "currentLanguageCode"
);

const languageOptions = document.querySelectorAll(
    ".language-option"
);

const navigationLinks = document.querySelectorAll(
    ".nav-link"
);

const internalLinks = document.querySelectorAll(
    'a[href^="#"]'
);

const translatableElements = document.querySelectorAll(
    "[data-i18n]"
);

const currentYear = document.getElementById("currentYear");


/* =========================================================
   3. CHARGEMENT DE LA PAGE
========================================================= */

window.addEventListener("load", () => {
    window.setTimeout(() => {
        if (pageLoader) {
            pageLoader.classList.add("hidden");
        }
    }, 500);
});


/* =========================================================
   4. ANNÉE AUTOMATIQUE
========================================================= */

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}


/* =========================================================
   5. MENU MOBILE
========================================================= */

function openMobileMenu() {
    if (!menuToggle || !navigationMenu) {
        return;
    }

    navigationMenu.classList.add("active");
    menuToggle.classList.add("active");

    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Fermer le menu");

    document.body.classList.add("menu-open");
}


function closeMobileMenu() {
    if (!menuToggle || !navigationMenu) {
        return;
    }

    navigationMenu.classList.remove("active");
    menuToggle.classList.remove("active");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Ouvrir le menu");

    document.body.classList.remove("menu-open");
}


function toggleMobileMenu() {
    if (!navigationMenu) {
        return;
    }

    const isOpen = navigationMenu.classList.contains("active");

    if (isOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}


if (menuToggle) {
    menuToggle.addEventListener("click", toggleMobileMenu);
}


navigationLinks.forEach((link) => {
    link.addEventListener("click", () => {
        closeMobileMenu();
    });
});


window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
        closeMobileMenu();
    }
});


/* =========================================================
   6. MENU DES LANGUES
========================================================= */

function openLanguageMenu() {
    if (!languageMenu || !languageButton) {
        return;
    }

    languageMenu.classList.add("active");
    languageButton.setAttribute("aria-expanded", "true");
}


function closeLanguageMenu() {
    if (!languageMenu || !languageButton) {
        return;
    }

    languageMenu.classList.remove("active");
    languageButton.setAttribute("aria-expanded", "false");
}


function toggleLanguageMenu() {
    if (!languageMenu) {
        return;
    }

    const isOpen = languageMenu.classList.contains("active");

    if (isOpen) {
        closeLanguageMenu();
    } else {
        openLanguageMenu();
    }
}


if (languageButton) {
    languageButton.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleLanguageMenu();
    });
}


if (languageMenu) {
    languageMenu.addEventListener("click", (event) => {
        event.stopPropagation();
    });
}


document.addEventListener("click", () => {
    closeLanguageMenu();
});


document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeLanguageMenu();
        closeMobileMenu();
    }
});


/* =========================================================
   7. SYSTÈME DE TRADUCTION
========================================================= */

function getNestedTranslation(object, path) {
    return path.split(".").reduce((currentValue, key) => {
        if (
            currentValue &&
            Object.prototype.hasOwnProperty.call(
                currentValue,
                key
            )
        ) {
            return currentValue[key];
        }

        return null;
    }, object);
}


async function fetchTranslations(language) {
    const response = await fetch(`lang/${language}.json`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(
            `Impossible de charger la langue : ${language}`
        );
    }

    return response.json();
}


function applyTranslations(translations) {
    translatableElements.forEach((element) => {
        const translationKey = element.dataset.i18n;
        const translatedText = getNestedTranslation(
            translations,
            translationKey
        );

        if (
            translatedText === null ||
            translatedText === undefined
        ) {
            console.warn(
                `Traduction introuvable : ${translationKey}`
            );

            return;
        }

        element.textContent = translatedText;
    });
}


function updateLanguageInterface(language) {
    if (currentLanguageCode) {
        currentLanguageCode.textContent =
            LANGUAGE_LABELS[language] || language.toUpperCase();
    }

    languageOptions.forEach((option) => {
        const isActive =
            option.dataset.language === language;

        option.classList.toggle("active", isActive);

        option.setAttribute(
            "aria-current",
            isActive ? "true" : "false"
        );
    });

    document.documentElement.lang = language;

    if (language === "zh") {
        document.documentElement.setAttribute("lang", "zh-CN");
    }
}


async function changeLanguage(language) {
    if (!AVAILABLE_LANGUAGES.includes(language)) {
        language = DEFAULT_LANGUAGE;
    }

    try {
        document.body.classList.add("language-loading");

        const translations = await fetchTranslations(language);

        applyTranslations(translations);
        updateLanguageInterface(language);

        localStorage.setItem(
            "preferredLanguage",
            language
        );

        closeLanguageMenu();
    } catch (error) {
        console.error(error);

        if (language !== DEFAULT_LANGUAGE) {
            await changeLanguage(DEFAULT_LANGUAGE);
        }
    } finally {
        document.body.classList.remove("language-loading");
    }
}


languageOptions.forEach((option) => {
    option.addEventListener("click", () => {
        const selectedLanguage =
            option.dataset.language;

        changeLanguage(selectedLanguage);
    });
});


function detectInitialLanguage() {
    const savedLanguage = localStorage.getItem(
        "preferredLanguage"
    );

    if (
        savedLanguage &&
        AVAILABLE_LANGUAGES.includes(savedLanguage)
    ) {
        return savedLanguage;
    }

    const browserLanguage =
        navigator.language
            .toLowerCase()
            .split("-")[0];

    if (AVAILABLE_LANGUAGES.includes(browserLanguage)) {
        return browserLanguage;
    }

    return DEFAULT_LANGUAGE;
}


/* =========================================================
   8. DÉFILEMENT FLUIDE
========================================================= */

internalLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        const targetSelector = link.getAttribute("href");

        if (
            !targetSelector ||
            targetSelector === "#"
        ) {
            return;
        }

        const targetElement =
            document.querySelector(targetSelector);

        if (!targetElement) {
            return;
        }

        event.preventDefault();

        const headerHeight =
            siteHeader?.offsetHeight || 0;

        const targetPosition =
            targetElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight -
            20;

        window.scrollTo({
            top: targetPosition,
            behavior: "smooth"
        });

        closeMobileMenu();
    });
});


/* =========================================================
   9. HEADER AU DÉFILEMENT
========================================================= */

function updateHeaderOnScroll() {
    if (!siteHeader) {
        return;
    }

    if (window.scrollY > 30) {
        siteHeader.classList.add("scrolled");
    } else {
        siteHeader.classList.remove("scrolled");
    }
}


window.addEventListener(
    "scroll",
    updateHeaderOnScroll,
    { passive: true }
);

updateHeaderOnScroll();


/* =========================================================
   10. LIEN ACTIF DANS LA NAVIGATION
========================================================= */

const pageSections = document.querySelectorAll(
    "main section[id]"
);


function updateActiveNavigationLink() {
    const scrollPosition =
        window.scrollY +
        window.innerHeight * 0.35;

    let currentSectionId = "home";

    pageSections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (
            scrollPosition >= sectionTop &&
            scrollPosition <
                sectionTop + sectionHeight
        ) {
            currentSectionId = section.id;
        }
    });

    navigationLinks.forEach((link) => {
        const linkTarget =
            link.getAttribute("href");

        link.classList.toggle(
            "active",
            linkTarget === `#${currentSectionId}`
        );
    });
}


window.addEventListener(
    "scroll",
    updateActiveNavigationLink,
    { passive: true }
);

window.addEventListener(
    "resize",
    updateActiveNavigationLink
);

updateActiveNavigationLink();


/* =========================================================
   11. ANIMATIONS D'APPARITION
========================================================= */

const animatedElements = document.querySelectorAll(
    [
        ".section-heading",
        ".about-main",
        ".information-card",
        ".project-card",
        ".store-card",
        ".skill-card",
        ".vision-card",
        ".contact-content",
        ".contact-information"
    ].join(",")
);


animatedElements.forEach((element) => {
    element.classList.add("reveal-element");
});


const revealObserver = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
        });
    },
    {
        threshold: 0.12,
        rootMargin: "0px 0px -50px 0px"
    }
);


animatedElements.forEach((element, index) => {
    element.style.setProperty(
        "--reveal-delay",
        `${Math.min(index % 4, 3) * 90}ms`
    );

    revealObserver.observe(element);
});


/* =========================================================
   12. EFFET 3D SUR LA CARTE DE PROFIL
========================================================= */

const profileCard = document.querySelector(
    ".profile-card"
);


function handleProfileCardMovement(event) {
    if (
        !profileCard ||
        window.innerWidth <= 900
    ) {
        return;
    }

    const cardRectangle =
        profileCard.getBoundingClientRect();

    const pointerX =
        event.clientX - cardRectangle.left;

    const pointerY =
        event.clientY - cardRectangle.top;

    const centerX =
        cardRectangle.width / 2;

    const centerY =
        cardRectangle.height / 2;

    const rotateY =
        ((pointerX - centerX) / centerX) * 5;

    const rotateX =
        ((centerY - pointerY) / centerY) * 5;

    profileCard.style.transform =
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}


function resetProfileCardPosition() {
    if (!profileCard) {
        return;
    }

    profileCard.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg)";
}


if (profileCard) {
    profileCard.addEventListener(
        "mousemove",
        handleProfileCardMovement
    );

    profileCard.addEventListener(
        "mouseleave",
        resetProfileCardPosition
    );
}


/* =========================================================
   13. EFFET DE LUMIÈRE SUR LES CARTES
========================================================= */

const interactiveCards = document.querySelectorAll(
    [
        ".project-card",
        ".store-card",
        ".skill-card",
        ".information-card"
    ].join(",")
);


interactiveCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
        const rectangle =
            card.getBoundingClientRect();

        const pointerX =
            event.clientX - rectangle.left;

        const pointerY =
            event.clientY - rectangle.top;

        card.style.setProperty(
            "--pointer-x",
            `${pointerX}px`
        );

        card.style.setProperty(
            "--pointer-y",
            `${pointerY}px`
        );
    });
});


/* =========================================================
   14. GESTION DES IMAGES MANQUANTES
========================================================= */

const importedImages = document.querySelectorAll(
    [
        ".profile-image",
        ".project-logo",
        ".store-icon img"
    ].join(",")
);


importedImages.forEach((image) => {
    image.addEventListener("error", () => {
        const parentElement = image.parentElement;

        image.style.display = "none";

        if (!parentElement) {
            return;
        }

        parentElement.classList.add("image-not-found");

        if (
            parentElement.querySelector(
                ".image-placeholder"
            )
        ) {
            return;
        }

        const placeholder =
            document.createElement("span");

        placeholder.className = "image-placeholder";
        placeholder.textContent =
            image.alt?.charAt(0).toUpperCase() || "JBK";

        parentElement.appendChild(placeholder);
    });
});


/* =========================================================
   15. ACCESSIBILITÉ AU CLAVIER
========================================================= */

languageOptions.forEach((option, index) => {
    option.addEventListener("keydown", (event) => {
        if (
            event.key !== "ArrowDown" &&
            event.key !== "ArrowUp"
        ) {
            return;
        }

        event.preventDefault();

        const direction =
            event.key === "ArrowDown" ? 1 : -1;

        const nextIndex =
            (
                index +
                direction +
                languageOptions.length
            ) % languageOptions.length;

        languageOptions[nextIndex].focus();
    });
});


/* =========================================================
   16. INITIALISATION
========================================================= */

async function initializeWebsite() {
    const initialLanguage =
        detectInitialLanguage();

    await changeLanguage(initialLanguage);
}


initializeWebsite();