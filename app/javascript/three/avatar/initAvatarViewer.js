import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

let renderer = null
let controls = null
let scene = null
let camera = null

const avatarParts = {
  upper_body: null,
  core: null,
  lower_body: null,
}

export function initAvatarViewer(levels) {
  const root = document.getElementById("avatar-root")
  if (!root) return
  if (renderer) return

  const width = root.clientWidth
  const height = root.clientHeight

  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  // Camera
  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
  camera.position.set(0, 1.6, 3)

  // Light
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(1, 2, 3)
  scene.add(light)
  scene.add(new THREE.AmbientLight(0xffffff, 0.4))

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  root.appendChild(renderer.domElement)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 1.4, 0)
  controls.update()

  loadPart("upper_body", levels.upper_body)
  loadPart("core", levels.core)
  loadPart("lower_body", levels.lower_body)

  animate()
}

function loadPart(part, level) {
  const loader = new GLTFLoader()
  const url = `/models/avatar/${part}_${level}.glb`

  if (avatarParts[part]) {
    scene.remove(avatarParts[part])
    avatarParts[part] = null
  }

  loader.load(url, (gltf) => {
    avatarParts[part] = gltf.scene
    scene.add(gltf.scene)
  })
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
