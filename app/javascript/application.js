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