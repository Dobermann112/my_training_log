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
  loader.load(
    "/models/humanoid.glb",
    (gltf) => {
      scene.add(gltf.scene)
      animate()
    },
    undefined,
    (error) => {
      console.error("[Three.js PoC] GLB load error", error)
    }
  )

  function animate() {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }  

  console.log("[Three.js PoC] orbit controls enabled")
}
