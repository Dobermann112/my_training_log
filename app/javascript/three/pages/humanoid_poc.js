import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

let renderer = null

export function initHumanoidPoc() {
  const root = document.getElementById("three-poc-root")
  if (!root) return
  if (renderer) return

  const width = root.clientWidth
  const height = root.clientHeight

  // Scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  // Camera
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
  camera.position.set(0, 1.6, 3)

  // Light（重要）
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(1, 2, 3)
  scene.add(light)

  const ambient = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambient)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  root.appendChild(renderer.domElement)

  // GLB Loader
  const loader = new GLTFLoader()
  loader.load(
    "/models/humanoid.glb",
    (gltf) => {
      const model = gltf.scene
      scene.add(model)
      renderer.render(scene, camera)
    },
    undefined,
    (error) => {
      console.error("[Three.js PoC] GLB load error", error)
    }
  )

  console.log("[Three.js PoC] humanoid loaded")
}
