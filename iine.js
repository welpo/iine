(() => {
  const SUPABASE_URL = 'https://vhiweeypifbwacashxjz.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_EoB7MFJhCmb6PiAk-GPJ4w_PGhQ44Ru';
  const DEFAULT_ICON = 'heart';
  const FALLBACK_LABEL = 'Send your appreciation';
  const DEFAULT_LABELS = {
    heart: 'Send a heart',
    thumbs_up: 'Send a thumbs up',
    upvote: 'Send an upvote'
  };

  const BUILTIN_ICONS = {
    heart:
      '<svg width="16" height="16" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" aria-hidden="true"><path d="M15 8C8.925 8 4 12.925 4 19c0 11 13 21 20 23.326C31 40 44 30 44 19c0-6.075-4.925-11-11-11c-3.72 0-7.01 1.847-9 4.674A10.99 10.99 0 0 0 15 8"/></svg>',
    thumbs_up:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>',
    upvote:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 17l-6-6-6 6"/><path d="M18 11l-6-6-6 6"/></svg>',
  };

  const formatCount = (count) => ` ${count}`;

  const getAccessibleLabel = (button, iconValue) => {
    if (button.dataset.ariaLabel) {
      return button.dataset.ariaLabel;
    }
    if (button.dataset.label) {
      return button.dataset.label;
    }
    return DEFAULT_LABELS[iconValue] || FALLBACK_LABEL;
  };

  const toggleFill = (icon, filled) => {
    const svg = icon.querySelector("svg");
    if (svg) {
      const iconType = icon.closest('.iine-button')?.dataset.icon || DEFAULT_ICON;
      if (iconType === 'upvote') {
        svg.setAttribute("stroke-width", filled ? "3" : "2");
      } else {
        const paths = svg.querySelectorAll("path, polygon, circle");
        paths.forEach((path) => {
          path.setAttribute("fill", filled ? "currentColor" : "none");
        });
      }
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    const iineButtons = document.querySelectorAll(".iine-button");
    if (iineButtons.length === 0) {
      return;
    }
    const slugs = Array.from(iineButtons).map(
      (button) => button.dataset.slug || window.location.pathname
    );
    const uniqueSlugs = [...new Set(slugs)];
    const counts = new Map();
    const fetchCounts = async () => {
      if (uniqueSlugs.length === 0) {
        return;
      }
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/rpc/get_hits`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
            },
            body: JSON.stringify({
              page_slugs: uniqueSlugs,
            }),
          }
        );
        if (!response.ok) throw new Error("Failed to fetch counts");
        const countsData = await response.json();
        if (countsData && typeof countsData === 'object' && !countsData.error) {
          for (const slug in countsData) {
            const count = countsData[slug];
            counts.set(slug, typeof count === 'number' ? count : 0);
          }
        }
      } catch (error) {
        console.error("Error fetching iine counts:", error);
      }
    };

    const initializeButtons = async () => {
      await fetchCounts();

      iineButtons.forEach((button) => {
        const slug = button.dataset.slug || window.location.pathname;
        const storageKey = `iine-clicked-${slug}`;
        let icon = button.querySelector(".icon");
        let counter = button.querySelector(".counter");

        if (!icon) {
          // Clear fallback content (e.g. <noscript> text) before building JS structure.
          button.textContent = "";
          icon = document.createElement("span");
          icon.className = "icon";
          button.appendChild(icon);
        }

        if (!counter) {
          counter = document.createElement("span");
          counter.className = "counter";
          button.appendChild(counter);
        }

        let count = counts.get(slug) || 0;
        counter.textContent = formatCount(count);

        const iconValue = button.dataset.icon || DEFAULT_ICON;

        if (!button.getAttribute('aria-label')) {
          const accessibleLabel = getAccessibleLabel(button, iconValue);
          button.setAttribute('aria-label', accessibleLabel);
          button.setAttribute('title', accessibleLabel);
        }
        button.removeAttribute('aria-hidden');
        const isPressed = !!localStorage.getItem(storageKey);
        button.setAttribute('aria-pressed', isPressed.toString());

        const descriptionId = `iine-description-${slug.replace(/\W/g, '-')}`;
        let description = document.getElementById(descriptionId);
        if (!description) {
          description = document.createElement('span');
          description.id = descriptionId;
          description.style.display = 'none';
          description.textContent = 'Already clicked.';
          document.body.appendChild(description);
        }

        if (BUILTIN_ICONS[iconValue]) {
          icon.innerHTML = BUILTIN_ICONS[iconValue];
        } else {
          icon.textContent = iconValue;
        }

        if (localStorage.getItem(storageKey)) {
          button.classList.add("clicked");
          button.setAttribute('aria-disabled', 'true');
          button.setAttribute('aria-describedby', descriptionId);
          if (BUILTIN_ICONS[iconValue]) {
            toggleFill(icon, true);
          }
        }

        const handleInteraction = async (event) => {
          if (localStorage.getItem(storageKey) || button.getAttribute('aria-disabled') === 'true') {
            return;
          }
          if (event) {
            event.preventDefault();
          }
          button.setAttribute('aria-disabled', 'true');
          localStorage.setItem(storageKey, "true");
          count++;
          button.classList.add("clicked");
          button.setAttribute('aria-pressed', 'true');
          button.setAttribute('aria-describedby', descriptionId);
          counter.textContent = formatCount(count);
          if (BUILTIN_ICONS[iconValue]) {
            toggleFill(icon, true);
          }
          fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_hits`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
            },
            body: JSON.stringify({ page_slug: slug }),
          }).catch(error => {
            console.error("Failed to increment page hits:", error);
          });
        };
        // Progressive enhancement: if button is in a form, intercept form submission.
        // This allows no-JS users to submit forms while JS users get smooth interactions.
        const form = button.closest('form');
        if (form) {
          form.addEventListener('submit', (event) => {
            event.preventDefault();
            handleInteraction(event);
          });
        } else {
          button.addEventListener("click", handleInteraction);
        }
        button.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleInteraction(event);
          }
        });
      });
    };

    initializeButtons();
  });
})();
