import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

let renderer = null
let controls = null
let scene = null
let camera = null
let loader = null

let rafId = null
let isRendering = false

let raycaster = null
let pointer = null
let avatarLevels = {}

let tooltipEl = null
let currentHoveredPart = null

let handlePointerMove = null
let handlePointerLeave = null

const avatarParts = {
  upper_body: null,
  core: null,
  lower_body: null,
}

export async function initAvatarViewer() {
  const root = document.getElementById("avatar-root")
  if (!root) return
  if (renderer && root.querySelector("canvas")) return

  root.replaceChildren()

  const width = root.clientWidth
  const height = root.clientHeight

  scene = new THREE.Scene()

  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setClearColor(0x000000, 0)
  root.appendChild(renderer.domElement)

  tooltipEl = createTooltip(root)

  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
  camera.position.set(0, 70, 95)

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.2)
  keyLight.position.set(50, 100, 100)
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
  fillLight.position.set(-50, 50, 100)
  scene.add(fillLight)

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.6)
  rimLight.position.set(0, 100, -100)
  scene.add(rimLight)

  scene.add(new THREE.AmbientLight(0xffffff, 0.2))

  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 40, 0)
  controls.enableZoom = true
  controls.minDistance = 85
  controls.maxDistance = 120
  controls.enablePan = false
  controls.minPolarAngle = Math.PI / 2 - 0.25
  controls.maxPolarAngle = Math.PI / 2 + 0.25
  controls.update()

  loader = new GLTFLoader()

  let levels
  try {
    levels = await fetchAvatarLevels()
  } catch (e) {
    console.error("[Avatar] failed to fetch levels", e)
    levels = {}
  }

  avatarLevels = {
    upper_body: levels.upper_body ?? "base",
    core:       levels.core       ?? "base",
    lower_body: levels.lower_body ?? "base",
  }

  loadPart("upper_body", avatarLevels.upper_body)
  loadPart("core", avatarLevels.core)
  loadPart("lower_body", avatarLevels.lower_body)

  // 初回は1回だけ描画（静止画）
  renderOnce()

  // 操作中のみ描画
  controls.addEventListener("start", startRender)
  controls.addEventListener("end", stopRender)

  handlePointerMove = (event) => {
    const part = getPointerPart(event)

    if (!part) {
      hideTooltip()
      return
    }

    if (currentHoveredPart !== part) {
      currentHoveredPart = part
      showTooltip(part, event)
      return
    }

    updateTooltipPosition(event)
  }

  handlePointerLeave = () => {
    hideTooltip()
  }

  renderer.domElement.addEventListener("pointermove", handlePointerMove)
  renderer.domElement.addEventListener("pointerleave", handlePointerLeave)
}

async function fetchAvatarLevels() {
  const res = await fetch("/api/avatar", {
    headers: { Accept: "application/json" }
  })
  if (!res.ok) {
    throw new Error(`Avatar API error: ${res.status}`)
  }
  return await res.json()
}

function loadPart(part, level) {
  if (!level) return
  const url = `/models/avatar/${part}_${level}.glb`

  if (avatarParts[part]) {
    disposeObject(avatarParts[part])
    scene.remove(avatarParts[part])
    avatarParts[part] = null
  }

  loader.load(url, (gltf) => {
    const obj = gltf.scene
    obj.position.set(0, 40, 0)
    obj.scale.set(50, 50, 50)
    obj.userData.part = part
    obj.userData.level = level

    avatarParts[part] = obj
    scene.add(obj)

    renderOnce()
  })
}

function startRender() {
  if (isRendering) return
  isRendering = true
  tick()
}

function stopRender() {
  isRendering = false
  if (rafId) cancelAnimationFrame(rafId)
  rafId = null
}

function tick() {
  if (!isRendering) return
  rafId = requestAnimationFrame(tick)
  controls.update()
  renderer.render(scene, camera)
}

function renderOnce() {
  controls.update()
  renderer.render(scene, camera)
}

function disposeObject(obj) {
  obj.traverse((child) => {
    if (!child.isMesh) return

    child.geometry?.dispose?.()

    const mat = child.material
    if (Array.isArray(mat)) {
      mat.forEach(m => m?.dispose?.())
    } else {
      mat?.dispose?.()
    }
  })
}

function findPartFromObject(object) {
  let current = object

  while (current) {
    if (current.userData?.part) return current.userData.part
    current = current.parent
  }

  return null
}

function getPointerPart(event) {
  if (!renderer || !camera || !raycaster || !pointer) return null

  const rect = renderer.domElement.getBoundingClientRect()

  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(pointer, camera)

  const targets = Object.values(avatarParts).filter(Boolean)
  const intersects = raycaster.intersectObjects(targets, true)

  if (intersects.length === 0) return null

  return findPartFromObject(intersects[0].object)
}

function formatPartLabel(part) {
  switch (part) {
    case "upper_body": return "上半身"
    case "core": return "体幹"
    case "lower_body": return "下半身"
    default: return ""
  }
}

function formatLevelLabel(level) {
  if (!level) return ""

  if (level === "base") return "Lv.0"

  const matched = String(level).match(/\d+/)
  if (matched) return `Lv.${matched[0]}`

  return String(level)
}

function createTooltip(root) {
  if (!root) return null

  root.style.position = "relative"

  const el = document.createElement("div")
  el.className = "avatar-part-tooltip"
  el.style.position = "absolute"
  el.style.display = "none"
  el.style.pointerEvents = "none"
  el.style.padding = "8px 12px"
  el.style.borderRadius = "12px"
  el.style.background = "rgba(20, 20, 24, 0.92)"
  el.style.color = "#fff"
  el.style.fontSize = "12px"
  el.style.fontWeight = "600"
  el.style.lineHeight = "1.4"
  el.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.28)"
  el.style.backdropFilter = "blur(8px)"
  el.style.webkitBackdropFilter = "blur(8px)"
  el.style.zIndex = "10"
  el.style.whiteSpace = "nowrap"
  el.style.transform = "translate(12px, 12px)"

  root.appendChild(el)
  return el
}

function showTooltip(part, event) {
  if (!tooltipEl) return

  const level = avatarLevels[part]
  const partLabel = formatPartLabel(part)
  const levelLabel = formatLevelLabel(level)

  tooltipEl.textContent = `${partLabel} ${levelLabel}`
  tooltipEl.style.display = "block"

  updateTooltipPosition(event)
}

function updateTooltipPosition(event) {
  if (!tooltipEl || !renderer) return

  const rect = renderer.domElement.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  tooltipEl.style.left = `${x}px`
  tooltipEl.style.top = `${y}px`
}

function hideTooltip() {
  if (!tooltipEl) return

  tooltipEl.style.display = "none"
  currentHoveredPart = null
}

export function destroyAvatarViewer() {
  stopRender()

  Object.values(avatarParts).forEach(obj => {
    if (!obj) return
    disposeObject(obj)
    scene?.remove(obj)
  })

  controls?.dispose()
  controls = null

  if (renderer?.domElement) {
    if (handlePointerMove) {
      renderer.domElement.removeEventListener("pointermove", handlePointerMove)
    }

    if (handlePointerLeave) {
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave)
    }
  }

  renderer?.dispose()
  if (renderer?.domElement?.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement)
  }

  tooltipEl?.remove()
  tooltipEl = null
  currentHoveredPart = null

  handlePointerMove = null
  handlePointerLeave = null
  avatarLevels = {}
  raycaster = null
  pointer = null

  renderer = null
  scene = null
  camera = null
  loader = null
}
