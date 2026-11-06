
import { create } from "zustand";

// Generate favicon using the active DaisyUI primary color.
const updateFavicon = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);

  // Read the resolved primary color from DaisyUI.
  const probe = document.createElement("span");
  probe.style.cssText =
    "position:absolute;visibility:hidden;background-color:var(--color-primary, hsl(var(--p)))";

  document.body.appendChild(probe);

  const primaryColor = getComputedStyle(probe).backgroundColor;

  probe.remove();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="15" fill="${primaryColor}"/>

      <path
        d="M46 29a18 18 0 0 1-25 16L13 48l2-9a18 18 0 1 1 31-10Z"
        fill="none"
        stroke="#fff"
        stroke-width="3.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <circle cx="22" cy="29" r="2" fill="#fff"/>
      <circle cx="30" cy="29" r="2" fill="#fff"/>
      <circle cx="38" cy="29" r="2" fill="#fff"/>

      <path
        d="M45 37l9 4v7c0 6-4 10-9 12-5-2-9-6-9-12v-7l9-4Z"
        fill="${primaryColor}"
        stroke="#fff"
        stroke-width="2.5"
        stroke-linejoin="round"
      />

      <rect x="41.5" y="46" width="7" height="6" rx="1.5" fill="#fff"/>
      <path d="M43 46v-2a2 2 0 0 1 4 0v2"
        fill="none" stroke="#fff" stroke-width="2"/>
    </svg>
  `;

  let favicon = document.querySelector('link[rel~="icon"]');

  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    document.head.appendChild(favicon);
  }

  favicon.type = "image/svg+xml";
  favicon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const initialTheme = localStorage.getItem("chat-theme") || "coffee";

// Apply theme and favicon on initial application load.
updateFavicon(initialTheme);

export const useThemeStore = create((set) => ({
  theme: initialTheme,

  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);

    updateFavicon(theme);

    set({ theme });
  },
}));
