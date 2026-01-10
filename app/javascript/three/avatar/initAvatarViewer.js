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

  root.replaceChildren()

  const width = root.clientWidth
  const height = root.clientHeight

  scene = new THREE.Scene()

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setClearColor(0x000000, 0) // ★ 透明化
  root.appendChild(renderer.domElement)

  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
  camera.position.set(0, 50, 150)

  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(1, 2, 3)
  scene.add(light)
  scene.add(new THREE.AmbientLight(0xffffff, 0.4))

  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 50, 0)
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
    const obj = gltf.scene

    obj.position.set(0,0,0)
    obj.scale.set(50,50,50)

    avatarParts[part] = obj
    scene.add(obj)

    console.log("[Avatar loaded]", part, level, obj)
  })
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
