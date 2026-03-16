document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("loader");
    const appFrame = document.querySelector(".app-frame");
    const ambientGlow = document.querySelector(".ambient-glow");
    const heroRail = document.querySelector(".hero-rail");
    const heroCopy = document.querySelector(".hero-copy");
    const heroAnimatedItems = Array.from(document.querySelectorAll(".hero-copy .reveal-left"));
    const animatedItems = Array.from(document.querySelectorAll(".ticker-item, .project-row, .info-card, .contact-panel .reveal-left"));
    const modal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");
    const closeButton = document.querySelector(".close");
    const navLinks = Array.from(document.querySelectorAll(".nav-item"));
    const sections = navLinks
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);
    window.addEventListener("load", () => {
        loader?.classList.add("hidden");

        heroRail?.animate(
            [
                { opacity: 0, transform: "translateX(-32px)" },
                { opacity: 1, transform: "translateX(0)" }
            ],
            {
                duration: 800,
                delay: 120,
                easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                fill: "both"
            }
        );

        heroAnimatedItems.forEach((item, index) => {
            item.animate(
                [
                    { opacity: 0, transform: "translateX(-72px)" },
                    { opacity: 1, transform: "translateX(0)" }
                ],
                {
                    duration: 1000,
                    delay: 260 + (index * 180),
                    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                    fill: "both"
                }
            );
        });
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.forEach((item) => item.classList.remove("active"));
            link.classList.add("active");
        });
    });

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                const currentId = `#${entry.target.id}`;
                navLinks.forEach((link) => {
                    link.classList.toggle("active", link.getAttribute("href") === currentId);
                });
            });
        },
        {
            rootMargin: "-35% 0px -45% 0px",
            threshold: 0.12
        }
    );

    sections.forEach((section) => sectionObserver.observe(section));

    const itemObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                const delay = Number(entry.target.dataset.delay || 0);
                const isHorizontal = entry.target.classList.contains("project-row") || entry.target.classList.contains("reveal-left");
                const keyframes = isHorizontal
                    ? [
                        { opacity: 0, transform: "translateX(-48px)" },
                        { opacity: 1, transform: "translateX(0)" }
                    ]
                    : [
                        { opacity: 0, transform: "translateY(32px)" },
                        { opacity: 1, transform: "translateY(0)" }
                    ];

                entry.target.animate(keyframes, {
                    duration: 850,
                    delay,
                    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                    fill: "both"
                });

                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.2,
            rootMargin: "0px 0px -10% 0px"
        }
    );

    animatedItems.forEach((item, index) => {
        item.dataset.delay = String((index % 4) * 140);
        itemObserver.observe(item);
    });

    let ticking = false;

    const updateScrollMotion = () => {
        const scrollY = window.scrollY;

        if (ambientGlow) {
            ambientGlow.style.transform = `translateX(-50%) translateY(${Math.max(scrollY * -0.08, -90)}px)`;
        }

        if (heroRail) {
            heroRail.style.transform = `translate3d(0, ${Math.max(scrollY * -0.045, -26)}px, 0)`;
        }

        if (heroCopy) {
            heroCopy.style.transform = `translate3d(0, ${Math.max(scrollY * -0.018, -14)}px, 0)`;
        }

        ticking = false;
    };

    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(updateScrollMotion);
            ticking = true;
        }
    }, { passive: true });

    window.openModal = (img) => {
        if (!modal || !modalImage) {
            return;
        }

        modalImage.src = img.src;
        modalImage.alt = img.alt;
        modal.hidden = false;
        modal.classList.add("open");
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        if (!modal) {
            return;
        }

        modal.classList.remove("open");
        modal.hidden = true;
        document.body.style.overflow = "";
    };

    closeButton?.addEventListener("click", closeModal);

    modal?.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeModal();
        }
    });
});
