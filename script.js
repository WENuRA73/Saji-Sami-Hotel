const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const menu = document.querySelector("#site-navigation");
const menuSymbol = document.querySelector(".menu-symbol");
const galleryButtons = [...document.querySelectorAll(".gallery-item")];
const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxCount = document.querySelector(".lightbox-count");
const lightboxCaption = document.querySelector(".lightbox-caption");
const closeButton = document.querySelector(".lightbox-close");
const previousButton = document.querySelector(".lightbox-nav.prev");
const nextButton = document.querySelector(".lightbox-nav.next");

let activeImage = -1;
let lastFocusedElement = null;

document.querySelectorAll("img").forEach((image) => {
  image.addEventListener("error", () => {
    if (image.dataset.fallbackTried === "true") return;

    const failedSource = image.currentSrc || image.src;
    const fallbackSource = failedSource.includes("/960/")
      ? failedSource.replace("/960/", "/4k/")
      : failedSource.replace("/4k/", "/960/");

    if (fallbackSource === failedSource) return;
    image.dataset.fallbackTried = "true";
    image.removeAttribute("srcset");
    image.src = fallbackSource;
  });
});

const setBodyLock = () => {
  const menuOpen = menu.classList.contains("is-open");
  document.body.classList.toggle("no-scroll", menuOpen || activeImage >= 0);
};

const closeMenu = () => {
  menu.classList.remove("is-open");
  header.classList.remove("is-menu-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
  menuSymbol.textContent = "☰";
  setBodyLock();
};

menuButton.addEventListener("click", () => {
  const willOpen = !menu.classList.contains("is-open");
  menu.classList.toggle("is-open", willOpen);
  header.classList.toggle("is-menu-open", willOpen);
  menuButton.setAttribute("aria-expanded", String(willOpen));
  menuButton.setAttribute("aria-label", willOpen ? "Close navigation" : "Open navigation");
  menuSymbol.textContent = willOpen ? "×" : "☰";
  setBodyLock();
});

menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const revealElements = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6%" });
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const showImage = (index) => {
  activeImage = (index + galleryButtons.length) % galleryButtons.length;
  const item = galleryButtons[activeImage];
  const imageName = item.dataset.name;
  const description = item.dataset.alt;
  lightboxImage.src = `public/images/redesign/4k/${imageName}.webp`;
  lightboxImage.alt = description;
  lightboxCount.textContent = `${String(activeImage + 1).padStart(2, "0")} / ${String(galleryButtons.length).padStart(2, "0")}`;
  lightboxCaption.textContent = description;
};

const openLightbox = (index) => {
  lastFocusedElement = document.activeElement;
  showImage(index);
  lightbox.hidden = false;
  setBodyLock();
  closeButton.focus();
};

const closeLightbox = () => {
  if (activeImage < 0) return;
  activeImage = -1;
  lightbox.hidden = true;
  lightboxImage.removeAttribute("src");
  setBodyLock();
  lastFocusedElement?.focus();
};

galleryButtons.forEach((button, index) => button.addEventListener("click", () => openLightbox(index)));
closeButton.addEventListener("click", closeLightbox);
previousButton.addEventListener("click", () => showImage(activeImage - 1));
nextButton.addEventListener("click", () => showImage(activeImage + 1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    closeLightbox();
  }
  if (activeImage >= 0 && event.key === "ArrowLeft") showImage(activeImage - 1);
  if (activeImage >= 0 && event.key === "ArrowRight") showImage(activeImage + 1);
});

document.querySelector("#copyright-year").textContent = new Date().getFullYear();
