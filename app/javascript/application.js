// Import Turbo
import "@hotwired/turbo-rails"

// Import Bootstrap JS globally
import "bootstrap"

// Import Stimulus (controllers)
import "./controllers"

// Import React
import "./react/root.tsx"

// Import Lucide
import { createIcons, icons } from "lucide";

document.addEventListener("turbo:load", () => {
    createIcons({ icons });
});

import { initHumanoidPoc } from "./three/pages/humanoid_poc.js";

document.addEventListener("turbo:load", () => {
  initHumanoidPoc()
})

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}
