// Typing animation words
const typingWords = [
  "appreciation",
  "likes",
  "cheers",
  "kudos",
  "hearts",
  "feedback",
  "love",
];
let wordIndex = 0;
let charIndex = typingWords[wordIndex].length;
let isDeleting = false;
let typingSpeed = 100;
let hasStarted = false;

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

function typeWriter() {
  const typedElement = document.getElementById("typed-words");
  if (!typedElement) return;

  if (prefersReducedMotion) {
    typedElement.textContent = "likes";
    return;
  }

  const currentWord = typingWords[wordIndex];

  // On first run, start deleting the pre-existing word
  if (!hasStarted) {
    hasStarted = true;
    isDeleting = true;
    charIndex = currentWord.length;
  }

  if (isDeleting) {
    typedElement.textContent = currentWord.substring(0, charIndex - 1);
    charIndex--;
    typingSpeed = 50;

    if (charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % typingWords.length;
      typingSpeed = 500; // Pause before typing next word
    }
  } else {
    typedElement.textContent = currentWord.substring(0, charIndex + 1);
    charIndex++;
    typingSpeed = 100;

    if (charIndex === currentWord.length) {
      isDeleting = true;
      typingSpeed = 2000; // Pause before deleting
    }
  }

  setTimeout(typeWriter, typingSpeed);
}

// Copy code functionality
function copyCode(button) {
  const codeBlock = button.parentElement;
  const section = button.closest('.setup-section, .customise-section');
  const iconSelector = section ? section.querySelector('.icon-selector') : null;
  let code = "";
  if (iconSelector) {
    // Logic for the "customise" section
    const checkedRadio = iconSelector.querySelector(
      'input[name="icon-selector"]:checked'
    );
    const radioId = checkedRadio?.id;
    const classMap = {
      "icon-heart": "heart-code",
      "icon-thumbs": "thumbs-code",
      "icon-upvote": "upvote-code",
      "icon-emoji": "emoji-code",
    };
    const codeClass = classMap[radioId];
    if (codeClass) {
      const element = codeBlock.querySelector(`.${codeClass} code`);
      if (element) {
        code = element.textContent;
      }
    }
  } else {
    // Logic for the "setup" section and others
    const codeElement = codeBlock.querySelector("code");
    if (codeElement) {
      code = codeElement.textContent;
    }
  }
  navigator.clipboard
    .writeText(code)
    .then(() => {
      const originalText = button.textContent;
      button.textContent = "copied!";
      button.style.background = "var(--success)";

      setTimeout(() => {
        button.textContent = originalText;
        button.style.background = "";
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
      button.textContent = "failed";
      button.style.background = "var(--warning)";
      setTimeout(() => {
        button.textContent = "copy";
        button.style.background = "";
      }, 2000);
    });
}

function initCopyButtons() {
  document.querySelectorAll(".copy-btn").forEach((button) => {
    button.addEventListener("click", () => copyCode(button));
  });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const href = this.getAttribute("href");

      // Handle scroll to top for empty fragment
      if (href === "#") {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        return;
      }

      const target = document.querySelector(href);
      if (target) {
        const navHeight = document.querySelector(".navbar").offsetHeight;
        const targetPosition = target.offsetTop - navHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
        setTimeout(() => {
          target.focus();
        }, 300);
      }
    });
  });
}

const coolEmoji = ["🔥", "💀", "💯", "🚀", "🎉", "♥️"];
let emojiIndex = 0;

function rotateEmoji() {
  const emojiElement = document.getElementById("rotating-emoji");
  if (emojiElement) {
    if (prefersReducedMotion) {
      emojiElement.textContent = coolEmoji[0];
      return;
    }
    setTimeout(() => {
      emojiIndex = (emojiIndex + 1) % coolEmoji.length;
      emojiElement.textContent = coolEmoji[emojiIndex];
      const emojiRadio = document.getElementById("icon-emoji");
      if (emojiRadio && emojiRadio.checked) {
        updateCustomEmojiPreview();
      }
    }, 150);
  }
}

function updateCustomEmojiPreview() {
  const previewBtn = document.querySelector(".emoji-preview .icon");
  const previewCode = document.querySelector(".emoji-code code");
  const currentEmoji = coolEmoji[emojiIndex];
  if (previewBtn) {
    previewBtn.textContent = currentEmoji;
  }
  if (previewCode) {
    previewCode.textContent = `<button
  class="iine-button"
  data-icon="${currentEmoji}"
  aria-hidden="true">
</button>`;
  }
}

function initEmojiListener() {
  const emojiRadio = document.getElementById("icon-emoji");
  if (emojiRadio) {
    emojiRadio.addEventListener("change", () => {
      if (emojiRadio.checked) {
        updateCustomEmojiPreview();
      }
    });
  }
}

const createCelebration = (button) => {
  if (prefersReducedMotion) {
    return;
  }
  const rect = button.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const iconType = button.dataset.icon;
  let celebrationIcon;
  if (iconType === "heart") {
    celebrationIcon = "❤️";
  } else if (iconType === "thumbs_up") {
    celebrationIcon = "👍";
  } else if (iconType === "upvote") {
    celebrationIcon = "⬆️";
  }
  for (let i = 0; i < 6; i++) {
    const particle = document.createElement("div");
    particle.textContent = celebrationIcon;
    particle.style.cssText = `
      position: fixed;
      left: ${centerX}px;
      top: ${centerY}px;
      font-size: 24px;
      pointer-events: none;
      z-index: 9999;
      transition: all 1s ease-out;
      user-select: none;
    `;
    document.body.appendChild(particle);
    particle.offsetHeight;
    requestAnimationFrame(() => {
      const angle = (i / 6) * Math.PI * 2;
      const distance = 80 + Math.random() * 50;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      particle.style.transform = `translate(${x}px, ${y}px)`;
      particle.style.opacity = "0";
    });
    setTimeout(() => {
      if (document.body.contains(particle)) {
        document.body.removeChild(particle);
      }
    }, 1100);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  if (!prefersReducedMotion) {
    setTimeout(typeWriter, 1800);
    setInterval(rotateEmoji, 3000);
  } else {
    // set static content for reduced motion users
    typeWriter();
    rotateEmoji();
  }

  initCopyButtons();
  initSmoothScrolling();
  initEmojiListener();

  const heroButtons = document.querySelectorAll(".hero-btn");
  heroButtons.forEach((button) => {
    const triggerCelebration = () => {
      if (button.getAttribute("aria-disabled") !== "true") {
        createCelebration(button);
      }
    };
    button.addEventListener("click", triggerCelebration);
    button.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        triggerCelebration();
      }
    });
  });
});
