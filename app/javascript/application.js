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
import { initAvatarViewer, destroyAvatarViewer } from "./three/avatar/initAvatarViewer"

// Turbo load
document.addEventListener("turbo:load", () => {
  createIcons({ icons })

  // avatar-root があるページだけ初期化
  const avatarRoot = document.getElementById("avatar-root")
  if (avatarRoot) {
    // levels は data 属性 or window などから渡す想定
    // 例: data-avatar-levels がある場合
    const levels = JSON.parse(avatarRoot.dataset.levels || "{}")
    initAvatarViewer(levels)
  }
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
