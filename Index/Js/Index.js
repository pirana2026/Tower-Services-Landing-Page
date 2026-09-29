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