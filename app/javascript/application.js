// Import Turbo
import "@hotwired/turbo-rails"

// Import Bootstrap JS globally
import "bootstrap"

// Import Stimulus (controllers)
import "./controllers"

// Import React
import "./react/root.tsx"

// Import Lucide
import { createIcons, icons } from "lucide"

// Import Three.js Avatar
// 初期化はReactのAvatarViewコンポーネントが行うため、ここではdestroyのみ扱う
import { destroyAvatarViewer } from "./three/avatar/initAvatarViewer"

// Turbo load
document.addEventListener("turbo:load", () => {
  createIcons({ icons })
})

// Turbo before render（画面遷移前に確実に破棄）
document.addEventListener("turbo:before-render", () => {
  destroyAvatarViewer()
})

// Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
  })
}
