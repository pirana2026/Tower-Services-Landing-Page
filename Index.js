(() => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (
    !("IntersectionObserver" in window) ||
    reduceMotion.matches
  ) {
    return;
  }

  // Content render hone se pehle reveal state enable karo.
  document.documentElement.classList.add("reveal-enabled");

 
 
  document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".cards .card");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        } else {
          entry.target.classList.remove("is-visible");
        }
      });
    }, {
      threshold: 0.15
    });

    cards.forEach((card, index) => {
      card.style.setProperty(
        "--reveal-delay",
        `${index * 180}ms`
      );

      observer.observe(card);
    });
  });
})();



// animate Tower 

// Reveal the title after the right hero finishes sliding in.
document.addEventListener("DOMContentLoaded", async () => {
  const title = document.getElementById("tower-title");
  const hero = document.querySelector(".hero-image");

  if (!title || !hero) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  // Reduced-motion users see the complete title immediately.
  if (reduceMotion.matches) return;

  const text = title.textContent.trim();

  // Keep the complete heading accessible to screen readers.
  title.setAttribute("aria-label", text);

  const characters = Array.from(text).map((character) => {
    const span = document.createElement("span");

    span.textContent = character;
    span.style.opacity = "0";
    span.setAttribute("aria-hidden", "true");

    return span;
  });

  title.replaceChildren(...characters);

  // Wait for the actual slide animation, not a fixed delay.
  const slideAnimations = hero.getAnimations().filter(
    (animation) => animation.animationName === "heroFromRight"
  );

  await Promise.allSettled(
    slideAnimations.map((animation) => animation.finished)
  );

  // Reveal one character every 75 milliseconds.
    const wait = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const typingSpeed = 100; // Har character ke beech delay
  const holdTime = 3000;   // Poora title kitni der dikhe
  const restartDelay = 300;

  repeat:
  while (title.isConnected && !reduceMotion.matches) {
    // Har cycle ki shuruaat mein characters hide karo.
    characters.forEach((span) => {
      span.style.opacity = "0";
    });

    await wait(restartDelay);

    // Characters ek-ek karke reveal karo.
    for (const character of characters) {
      if (reduceMotion.matches || !title.isConnected) {
        break repeat;
      }

      character.style.opacity = "1";
      await wait(typingSpeed);
    }

    // Poora title dikhane ke baad loop dobara chalega.
    await wait(holdTime);
  }

  // Reduced motion enable hone par full title dikhao.
  characters.forEach((span) => {
    span.style.opacity = "1";
  });
});


// // Smooth 60FPS Card Hover & Focus Effect
// document.addEventListener("DOMContentLoaded", () => {
//   const cards = document.querySelectorAll(".card");
//   const cardsGrid = document.querySelector(".cards") || document.querySelector(".grid");

//   let animationFrameId = null;

//   cards.forEach((card) => {
//     card.addEventListener("mousemove", (e) => {
//       const rect = card.getBoundingClientRect();
//       const x = e.clientX - rect.left - rect.width / 2;
//       const y = e.clientY - rect.top - rect.height / 2;

//       // Unnecessary DOM reflows bachane ke liye requestAnimationFrame
//       if (animationFrameId) cancelAnimationFrame(animationFrameId);

//       animationFrameId = requestAnimationFrame(() => {
//         // Active card: Gentle 3D Tilt + Smooth 1.05 Scale
//         card.style.transform = `perspective(1000px) rotateX(${y / 40}deg) rotateY(${-x / 40}deg) scale(1.05) translateY(-6px)`;
//         card.style.opacity = "1";

//         // Non-hovered cards: Smoothly shrink to 0.95 without abrupt snapping
//         cards.forEach((otherCard) => {
//           if (otherCard !== card) {
//             otherCard.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(0.95) translateY(0px)";
//             otherCard.style.opacity = "0.75";
//           }
//         });
//       });
//     });
//   });

//   // Jab mouse poore grid/cards container se bahar nikal jaye tabhi sab normal scale hongi
//   if (cardsGrid) {
//     cardsGrid.addEventListener("mouseleave", () => {
//       if (animationFrameId) cancelAnimationFrame(animationFrameId);
      
//       cards.forEach((anyCard) => {
//         anyCard.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0px)";
//         anyCard.style.opacity = "1";
//       });
//     });
//   }
// });

// Extremely Smooth & Subtle Card Mousemove Track
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card");
  const cardsGrid = document.querySelector(".cards") || document.querySelector(".grid");

  let animationFrameId = null;

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      animationFrameId = requestAnimationFrame(() => {
        // Active card: Subtle 1.025 Scale + Soft Tilt
        card.style.transform = `perspective(1000px) rotateX(${y / 45}deg) rotateY(${-x / 45}deg) scale(1.025) translateY(-4px)`;
        card.style.opacity = "1";

        // Non-hovered cards: Soft 0.98 scale
        cards.forEach((otherCard) => {
          if (otherCard !== card) {
            otherCard.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(0.98) translateY(0px)";
            otherCard.style.opacity = "0.85";
          }
        });
      });
    });
  });

  if (cardsGrid) {
    cardsGrid.addEventListener("mouseleave", () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      
      cards.forEach((anyCard) => {
        anyCard.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0px)";
        anyCard.style.opacity = "1";
      });
    });
  }
});


// START: this is js for falling leaves 



// Hero Section Bound Falling Leaves
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("bg-particles");
  const heroSection = document.querySelector(".hero");
  if (!canvas || !heroSection) return;

  const ctx = canvas.getContext("2d");
  let leaves = [];

  function resizeCanvas() {
    canvas.width = heroSection.offsetWidth;
    canvas.height = heroSection.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const colors = [
    "rgba(168, 209, 132, 0.7)",
    "rgba(132, 178, 101, 0.6)",
    "rgba(214, 240, 138, 0.75)",
    "rgba(90, 150, 60, 0.55)"
  ];

  class Leaf {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height : -15;
      this.size = Math.random() * 5 + 4;
      
      this.speedY = Math.random() * 0.7 + 0.3;
      this.speedX = Math.random() * 0.5 - 0.25;
      
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.03;

      this.flipX = Math.random() * Math.PI * 2;
      this.flipY = Math.random() * Math.PI * 2;
      this.flipSpeedX = Math.random() * 0.03 + 0.01;
      this.flipSpeedY = Math.random() * 0.02 + 0.01;

      this.oscillation = Math.random() * Math.PI * 2;
      this.oscillationSpeed = Math.random() * 0.02 + 0.01;

      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.y += this.speedY;
      this.oscillation += this.oscillationSpeed;
      this.x += Math.sin(this.oscillation) * 0.6 + this.speedX;

      this.rotation += this.rotationSpeed;
      this.flipX += this.flipSpeedX;
      this.flipY += this.flipSpeedY;

      // Hero section ki height cross karte hi reset ho jayegi
      if (this.y > canvas.height + 15 || this.x < -20 || this.x > canvas.width + 20) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      
      ctx.rotate(this.rotation);
      ctx.scale(Math.sin(this.flipX), Math.cos(this.flipY));

      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.bezierCurveTo(
        this.size / 2, -this.size / 2,
        this.size / 2, this.size / 2,
        0, this.size
      );
      ctx.bezierCurveTo(
        -this.size / 2, this.size / 2,
        -this.size / 2, -this.size / 2,
        0, -this.size
      );

      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < 25; i++) {
    leaves.push(new Leaf());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    leaves.forEach((leaf) => {
      leaf.update();
      leaf.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();
});

// END: end of js of falling leaves

// Slow Staggered Scroll Reveal for Resources
document.addEventListener("DOMContentLoaded", () => {
  const resourceLinks = document.querySelectorAll(".resource-links a");
  if (!resourceLinks.length) return;

  resourceLinks.forEach((link, index) => {
    link.classList.add("reveal-resource");
    // Har item ke beech 250ms ka slow gap taaki ek-ek karke clear dikhe
    link.style.transitionDelay = `${index * 300}ms`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  }, {
    threshold: 0.15
  });

  resourceLinks.forEach((link) => observer.observe(link));
});


// this is scroll color change
// Background Gradient Switch (Cards -> FROM EXPLORATION TO ACTION)
document.addEventListener("DOMContentLoaded", () => {
  const serviceCards = document.querySelectorAll(".cards .card");
  const howSection = document.getElementById("how");

  if (!serviceCards.length || !howSection) return;

  // Stage 1: Service Cards dikhte hi Soft Organic Green Overlay Activate
  const cardsObserver = new IntersectionObserver(
    (entries) => {
      const isCardVisible = entries.some((entry) => entry.isIntersecting);
      if (isCardVisible) {
        document.body.classList.add("cards-visible-bg");
      } else {
        document.body.classList.remove("cards-visible-bg");
      }
    },
    { threshold: 0.15 }
  );

  // Stage 2: "FROM EXPLORATION TO ACTION" (#how) dikhte hi Green Overlay Fade Out
  const howObserver = new IntersectionObserver(
    (entries) => {
      const isHowVisible = entries.some((entry) => entry.isIntersecting);
      if (isHowVisible) {
        document.body.classList.add("how-visible-bg");
      } else {
        document.body.classList.remove("how-visible-bg");
      }
    },
    { threshold: 0.05 } // 5% element dikhte hi triggers safely without flicker
  );

  serviceCards.forEach((card) => cardsObserver.observe(card));
  howObserver.observe(howSection);
});

// Text Scroll Reveal (Har Baar Scroll Karne Par Repeat Hoga)
document.addEventListener("DOMContentLoaded", () => {
  const animatedTexts = document.querySelectorAll(".animate-text");
  if (!animatedTexts.length) return;

  const textObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible"); // View mein aane par show
        } else {
          entry.target.classList.remove("is-visible"); // View se bahar jaane par reset
        }
      });
    },
    {
      threshold: 0.2, // 20% visible hote hi animation repeat trigger hoga
    }
  );

  animatedTexts.forEach((el) => textObserver.observe(el));
});

// stacd button 
// STACD Popup Modal Trigger
document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("openStacdModal");
  const closeBtn = document.getElementById("closeStacdModal");
  const modalOverlay = document.getElementById("stacdModalOverlay");

  if (!openBtn || !modalOverlay) return;

  function openModal() {
    modalOverlay.classList.add("is-open");
    modalOverlay.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    modalOverlay.classList.remove("is-open");
    modalOverlay.setAttribute("aria-hidden", "true");
  }

  openBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  // Close when clicking outside the container (on backdrop)
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Close on Escape key press
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.classList.contains("is-open")) {
      closeModal();
    }
  });
});



// About Us Section Scroll Reveal Trigger
document.addEventListener("DOMContentLoaded", () => {
  const aboutSection = document.getElementById("about");

  if (!aboutSection) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const card = entry.target.querySelector(".animate-about-card");
        const texts = entry.target.querySelectorAll(".animate-about-text");

        if (entry.isIntersecting) {
          if (card) card.classList.add("is-visible");
          texts.forEach((el) => el.classList.add("is-visible"));
        } else {
          if (card) card.classList.remove("is-visible");
          texts.forEach((el) => el.classList.remove("is-visible"));
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(aboutSection);
});

// change footer color on scroll
// Background Gradient Switch (Cards -> HOW -> Footer)
document.addEventListener("DOMContentLoaded", () => {
  const serviceCards = document.querySelectorAll(".cards .card");
  const howSection = document.getElementById("how");
  const footerSection = document.querySelector(".site-footer");

  // 1. Service Cards Observer
  if (serviceCards.length) {
    const cardsObserver = new IntersectionObserver(
      (entries) => {
        const isCardVisible = entries.some((entry) => entry.isIntersecting);
        if (isCardVisible) {
          document.body.classList.add("cards-visible-bg");
        } else {
          document.body.classList.remove("cards-visible-bg");
        }
      },
      { threshold: 0.15 }
    );
    serviceCards.forEach((card) => cardsObserver.observe(card));
  }

  // 2. HOW Section Observer (#how)
  if (howSection) {
    const howObserver = new IntersectionObserver(
      (entries) => {
        const isHowVisible = entries.some((entry) => entry.isIntersecting);
        if (isHowVisible) {
          document.body.classList.add("how-visible-bg");
        } else {
          document.body.classList.remove("how-visible-bg");
        }
      },
      { threshold: 0.05 }
    );
    howObserver.observe(howSection);
  }

  // 3. Footer Observer (.site-footer) - Activates Dark Gradient
  if (footerSection) {
    const footerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            document.body.classList.add("footer-visible-bg");
          } else {
            document.body.classList.remove("footer-visible-bg");
          }
        });
      },
      { threshold: 0.1 } // 10% footer screen par aate hi active ho jayega
    );
    footerObserver.observe(footerSection);
  }
});