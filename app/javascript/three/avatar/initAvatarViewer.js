import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

// Three.jsの主要オブジェクト
let renderer = null
let controls = null
let scene = null
let camera = null
let loader = null

// requestAnimationFrame による描画制御用
let rafId = null
let isRendering = false

// Raycaster による部位判定用
let raycaster = null
let pointer = null
let avatarLevels = {}

// ツールチップ表示制御用
let tooltipEl = null
let currentHoveredPart = null

// Turbo遷移などで確実に解除できるよう、イベントハンドラを保持する
let handlePointerMove = null
let handlePointerLeave = null
let handleClick = null

// 読み込んだアバターパーツを部位ごとに保持する
const avatarParts = {
  upper_body: null,
  core: null,
  lower_body: null,
}

export async function initAvatarViewer() {
  const root = document.getElementById("avatar-root")
  if (!root) return

  // すでにcanvasが存在する場合は二重初期化を防ぐ
  if (renderer && root.querySelector("canvas")) return

  // 再初期化時に既存要素をクリアする
  root.replaceChildren()

  const width = root.clientWidth
  const height = root.clientHeight

  // 3Dシーンを作成する
  scene = new THREE.Scene()

  // マウス位置 / タップ位置から3Dモデルへの当たり判定を行うための準備
  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()

  // 3D描画を行うrendererを生成してroot配下に追加する
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setClearColor(0x000000, 0)
  root.appendChild(renderer.domElement)

  // パーツ情報を表示するツールチップを生成する
  tooltipEl = createTooltip(root)

  // カメラの位置と視野角を設定する
  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
  camera.position.set(0, 70, 95)

  // アバターを見やすくするためのライト設定
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

  // OrbitControls で回転・ズーム操作を可能にする
  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 40, 0)
  controls.enableZoom = true
  controls.minDistance = 85
  controls.maxDistance = 120
  controls.enablePan = false
  controls.minPolarAngle = Math.PI / 2 - 0.25
  controls.maxPolarAngle = Math.PI / 2 + 0.25
  controls.update()

  // GLBモデル読み込み用ローダー
  loader = new GLTFLoader()

  // APIから現在の部位レベルを取得する
  let levels
  try {
    levels = await fetchAvatarLevels()
  } catch (e) {
    console.error("[Avatar] failed to fetch levels", e)
    levels = {}
  }

  // レベル未取得時は base を初期値として扱う
  avatarLevels = {
    upper_body: levels.upper_body ?? "base",
    core:       levels.core       ?? "base",
    lower_body: levels.lower_body ?? "base",
  }

  // 各部位のモデルを現在レベルに応じて読み込む
  loadPart("upper_body", avatarLevels.upper_body)
  loadPart("core", avatarLevels.core)
  loadPart("lower_body", avatarLevels.lower_body)

  // 初回は1回だけ描画（静止画）
  renderOnce()

  // OrbitControls操作中のみ連続描画を行う
  controls.addEventListener("start", startRender)
  controls.addEventListener("end", stopRender)

  // PCではhover時に部位を判定してツールチップを表示する
  handlePointerMove = (event) => {
    if (isTouchDevice()) return

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

  // PCでcanvas外へ出た時はツールチップを閉じる
  handlePointerLeave = () => {
    if (isTouchDevice()) return
    hideTooltip()
  }

  // モバイルではtap時に部位を判定してツールチップを表示する
  handleClick = (event) => {
    if (!isTouchDevice()) return

    const part = getPointerPart(event)

    if (!part) {
      hideTooltip()
      return
    }

    currentHoveredPart = part
    showTooltip(part, event)
  }

  renderer.domElement.addEventListener("pointermove", handlePointerMove)
  renderer.domElement.addEventListener("pointerleave", handlePointerLeave)
  renderer.domElement.addEventListener("click", handleClick)
}

// /api/avatar から現在の各部位レベルを取得する
async function fetchAvatarLevels() {
  const res = await fetch("/api/avatar", {
    headers: { Accept: "application/json" }
  })
  if (!res.ok) {
    throw new Error(`Avatar API error: ${res.status}`)
  }
  return await res.json()
}

// 指定された部位・レベルのGLBモデルを読み込み、sceneに追加する
function loadPart(part, level) {
  if (!level) return
  const url = `/models/avatar/${part}_${level}.glb`

  // 既存モデルがある場合は破棄して差し替える
  if (avatarParts[part]) {
    disposeObject(avatarParts[part])
    scene.remove(avatarParts[part])
    avatarParts[part] = null
  }

  loader.load(url, (gltf) => {
    const obj = gltf.scene
    obj.position.set(0, 40, 0)
    obj.scale.set(50, 50, 50)

    // Raycasterで判定した時にどの部位か分かるよう情報を持たせる
    obj.userData.part = part
    obj.userData.level = level

    avatarParts[part] = obj
    scene.add(obj)

    // モデル読み込み後に1回だけ再描画する
    renderOnce()
  })
}

// 連続描画を開始する
function startRender() {
  if (isRendering) return
  isRendering = true
  tick()
}

// 連続描画を停止する
function stopRender() {
  isRendering = false
  if (rafId) cancelAnimationFrame(rafId)
  rafId = null
}

// 操作中のみ requestAnimationFrame で描画を回す
function tick() {
  if (!isRendering) return
  rafId = requestAnimationFrame(tick)
  controls.update()
  renderer.render(scene, camera)
}

// 静止状態の画面を1回だけ描画する
function renderOnce() {
  controls.update()
  renderer.render(scene, camera)
}

// モデル差し替え時にgeometry/materialを明示的に破棄する
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

// Raycasterでヒットしたmeshから親をたどって部位情報を探す
function findPartFromObject(object) {
  let current = object

  while (current) {
    if (current.userData?.part) return current.userData.part
    current = current.parent
  }

  return null
}

// マウス / タップ位置から、現在当たっている部位を返す
function getPointerPart(event) {
  if (!renderer || !camera || !raycaster || !pointer) return null

  const rect = renderer.domElement.getBoundingClientRect()

  // 画面座標を Three.js 用の正規化座標（-1〜1）へ変換する
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(pointer, camera)

  const targets = Object.values(avatarParts).filter(Boolean)
  const intersects = raycaster.intersectObjects(targets, true)

  if (intersects.length === 0) return null

  return findPartFromObject(intersects[0].object)
}

// 内部の部位キーを画面表示用ラベルへ変換する
function formatPartLabel(part) {
  switch (part) {
    case "upper_body": return "上半身"
    case "core": return "体幹"
    case "lower_body": return "下半身"
    default: return ""
  }
}

// level文字列を画面表示用の Lv.表記へ変換する
function formatLevelLabel(level) {
  if (!level) return ""

  if (level === "base") return "Lv.0"

  const matched = String(level).match(/\d+/)
  if (matched) return `Lv.${matched[0]}`

  return String(level)
}

// ツールチップDOMを生成してroot配下に追加する
function createTooltip(root) {
  if (!root) return null

  // absolute配置の基準にする
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

// 指定部位のラベルとレベルをツールチップに表示する
function showTooltip(part, event) {
  if (!tooltipEl) return

  const level = avatarLevels[part]
  const partLabel = formatPartLabel(part)
  const levelLabel = formatLevelLabel(level)

  tooltipEl.textContent = `${partLabel} ${levelLabel}`
  tooltipEl.style.display = "block"

  updateTooltipPosition(event)
}

// ツールチップを現在のポインター位置へ移動する
function updateTooltipPosition(event) {
  if (!tooltipEl || !renderer) return

  const rect = renderer.domElement.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  tooltipEl.style.left = `${x}px`
  tooltipEl.style.top = `${y}px`
}

// ツールチップを非表示にする
function hideTooltip() {
  if (!tooltipEl) return

  tooltipEl.style.display = "none"
  currentHoveredPart = null
}

// hoverできないタッチ端末かどうかを判定する
function isTouchDevice() {
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches
}

export function destroyAvatarViewer() {
  // 連続描画を停止する
  stopRender()

  // 読み込み済みの3Dモデルを破棄してsceneから外す
  Object.values(avatarParts).forEach(obj => {
    if (!obj) return
    disposeObject(obj)
    scene?.remove(obj)
  })

  // OrbitControls を破棄する
  controls?.dispose()
  controls = null

  // 登録済みイベントを解除する
  if (renderer?.domElement) {
    if (handlePointerMove) {
      renderer.domElement.removeEventListener("pointermove", handlePointerMove)
    }

    if (handlePointerLeave) {
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave)
    }

    if (handleClick) {
      renderer.domElement.removeEventListener("click", handleClick)
    }
  }

  // renderer と canvas を破棄する
  renderer?.dispose()
  if (renderer?.domElement?.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement)
  }

  // ツールチップと各種状態をリセットする
  tooltipEl?.remove()
  tooltipEl = null
  currentHoveredPart = null

  handlePointerMove = null
  handlePointerLeave = null
  handleClick = null
  avatarLevels = {}
  raycaster = null
  pointer = null

  renderer = null
  scene = null
  camera = null
  loader = null
}
