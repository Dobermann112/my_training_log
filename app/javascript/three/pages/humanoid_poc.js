import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

let renderer = null
let controls = null

export function initHumanoidPoc() {
  const root = document.getElementById("three-poc-root")
  if (!root) return
  if (renderer) return

  const width = root.clientWidth
  const height = root.clientHeight

  // Scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  const avatarParts = {
    upper_body: null,
    core: null,
    lower_body: null,
  }

  // Camera
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
  camera.position.set(0, 1.6, 3)

  // Light
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(1, 2, 3)
  scene.add(light)

  const ambient = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambient)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  root.appendChild(renderer.domElement)

  // Controls（追加）
  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 1.4, 0)
  controls.update()

  // Loader
  const loader = new GLTFLoader()

  loadPart("upper_body", "base")
  loadPart("core", "base")
  loadPart("lower_body", "base")

  animate()

  function animate() {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }  

  function loadPart(part, level) {
    const url = `/models/avatar/${part}_${level}.glb`
  
    // 既存パーツがあれば削除（差し替え）
    if (avatarParts[part]) {
      scene.remove(avatarParts[part])
      avatarParts[part] = null
    }
  
    loader.load(
      url,
      (gltf) => {
        const obj = gltf.scene
        scene.add(obj)
        avatarParts[part] = obj
        console.log("[Avatar] loaded", part, level)
      },
      undefined,
      (error) => {
        console.error("[Avatar] load error", part, level, error)
      }
    )
  }  

  setTimeout(() => loadPart("upper_body", "level_3"), 1500)
  setTimeout(() => loadPart("lower_body", "level_7"), 3000)

  console.log("[Three.js PoC] orbit controls enabled")
}
