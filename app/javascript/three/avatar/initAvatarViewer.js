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

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setClearColor(0x000000, 0)
  root.appendChild(renderer.domElement)

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

  levels = {
    upper_body: levels.upper_body ?? "base",
    core:       levels.core       ?? "base",
    lower_body: levels.lower_body ?? "base",
  }

  loadPart("upper_body", levels.upper_body)
  loadPart("core", levels.core)
  loadPart("lower_body", levels.lower_body)

  // 初回は1回だけ描画（静止画）
  renderOnce()

  // 操作中のみ描画
  controls.addEventListener("start", startRender)
  controls.addEventListener("end", stopRender)
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

export function destroyAvatarViewer() {
  stopRender()

  Object.values(avatarParts).forEach(obj => {
    if (!obj) return
    disposeObject(obj)
    scene?.remove(obj)
  })

  controls?.dispose()
  controls = null

  renderer?.dispose()
  if (renderer?.domElement?.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement)
  }

  renderer = null
  scene = null
  camera = null
  loader = null
}
