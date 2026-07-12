import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment"

// パーツ切り替え時のクロスフェード演出時間(ms)
const CROSSFADE_DURATION = 500

// アバター本体に適用するブランドカラー(--color-primary系)のtint
const AVATAR_TINT_COLOR = 0x3a86ff

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

// ローディング/エラー表示制御用
let statusEl = null

// レベル進捗バッジ表示制御用
let badgeEl = null
let badgeRowEls = {}

// バッジ表示上のパーツ表示順
const PART_ORDER = ["upper_body", "core", "lower_body"]

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
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  root.appendChild(renderer.domElement)

  // IBL環境光を設定し、フラットな陰影を和らげてPBRマテリアルを馴染ませる
  const pmremGenerator = new THREE.PMREMGenerator(renderer)
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture
  pmremGenerator.dispose()

  // パーツ情報を表示するツールチップを生成する
  tooltipEl = createTooltip(root)

  // レベル進捗バッジを生成する
  badgeEl = createLevelBadge(root)

  // ローディング表示を生成し、取得中である旨を伝える
  statusEl = createStatus(root)
  setAvatarStatus("loading", "読み込み中...")

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
  let fetchFailed = false
  try {
    levels = await fetchAvatarLevels()
  } catch (e) {
    console.error("[Avatar] failed to fetch levels", e)
    levels = {}
    fetchFailed = true
  }

  // レベル未取得時は base・進捗0を初期値として扱う
  const fallback = { level: "base", progress: 0, next_level: "level_3" }
  avatarLevels = {
    upper_body: levels.upper_body ?? fallback,
    core:       levels.core       ?? fallback,
    lower_body: levels.lower_body ?? fallback,
  }

  // 各部位のモデルを現在レベルに応じて読み込む
  loadPart("upper_body", avatarLevels.upper_body.level)
  loadPart("core", avatarLevels.core.level)
  loadPart("lower_body", avatarLevels.lower_body.level)

  // レベル進捗バッジを最新の状態に更新する
  updateLevelBadge()

  // 初回は1回だけ描画（静止画）
  renderOnce()

  if (fetchFailed) {
    setAvatarStatus("error", "最新のステータス取得に失敗しました。基本アバターを表示しています。")
  } else {
    setAvatarStatus("hidden")
  }

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
// 既存モデルがある場合は即座に差し替えず、クロスフェードで滑らかに切り替える
function loadPart(part, level) {
  if (!level) return
  const url = `/models/avatar/${part}_${level}.glb`

  const previousObj = avatarParts[part]

  loader.load(
    url,
    (gltf) => {
      const obj = gltf.scene
      obj.position.set(0, 40, 0)
      obj.scale.set(50, 50, 50)

      // Raycasterで判定した時にどの部位か分かるよう情報を持たせる
      obj.userData.part = part
      obj.userData.level = level

      // ライト/ダーク両テーマの背景に埋もれないよう、ブランドカラーでtintする
      applyAvatarTint(obj)

      avatarParts[part] = obj
      scene.add(obj)

      crossfadeParts(previousObj, obj)
    },
    undefined,
    (error) => {
      console.error(`[Avatar] failed to load part: ${part}`, error)
      setAvatarStatus("error", "一部のアバターパーツの読み込みに失敗しました。")
    }
  )
}

// オブジェクト配下のメッシュ全体をブランドカラーでtintする
function applyAvatarTint(obj) {
  obj.traverse((child) => {
    if (!child.isMesh) return

    const materials = Array.isArray(child.material) ? child.material : [child.material]
    materials.forEach((mat) => {
      if (!mat?.color) return
      mat.color.set(AVATAR_TINT_COLOR)
    })
  })
}

// オブジェクト配下のメッシュ全体に不透明度を設定する
function setObjectOpacity(obj, opacity) {
  obj.traverse((child) => {
    if (!child.isMesh) return

    const materials = Array.isArray(child.material) ? child.material : [child.material]
    materials.forEach((mat) => {
      if (!mat) return
      mat.transparent = true
      mat.opacity = opacity
    })
  })
}

// 旧モデルをフェードアウトしつつ新モデルをフェードインし、成長演出を滑らかにする
function crossfadeParts(previousObj, nextObj, duration = CROSSFADE_DURATION) {
  const startTime = performance.now()
  setObjectOpacity(nextObj, 0)
  if (previousObj) setObjectOpacity(previousObj, 1)

  function step(now) {
    const t = Math.min((now - startTime) / duration, 1)
    setObjectOpacity(nextObj, t)
    if (previousObj) setObjectOpacity(previousObj, 1 - t)

    renderer.render(scene, camera)

    if (t < 1) {
      requestAnimationFrame(step)
      return
    }

    if (previousObj) {
      disposeObject(previousObj)
      scene.remove(previousObj)
    }
  }

  requestAnimationFrame(step)
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

// 内部tier名(base/level_3/level_7)を画面表示用の1始まりレベル番号に対応させる
const LEVEL_DISPLAY_NUMBER = { base: 1, level_3: 2, level_7: 3 }

// level文字列を画面表示用の Lv.表記へ変換する
function formatLevelLabel(level) {
  if (!level) return ""

  const num = LEVEL_DISPLAY_NUMBER[level]
  return num ? `Lv.${num}` : String(level)
}

// 部位の進捗(progress: 0.0〜1.0)を画面表示用のパーセント表記へ変換する
function formatPercentLabel(stat) {
  if (!stat) return ""
  if (!stat.next_level) return "MAX"

  return `${Math.round((stat.progress ?? 0) * 100)}%`
}

// ツールチップDOMを生成してroot配下に追加する（配色はSCSS側のテーマ変数に委ねる）
function createTooltip(root) {
  if (!root) return null

  // absolute配置の基準にする
  root.style.position = "relative"

  const el = document.createElement("div")
  el.className = "avatar-part-tooltip"
  el.style.display = "none"
  el.style.transform = "translate(12px, 12px)"

  root.appendChild(el)
  return el
}

// ローディング/エラー状態を表示するDOMを生成してroot配下に追加する
function createStatus(root) {
  if (!root) return null

  const el = document.createElement("div")
  el.className = "avatar-status"

  root.appendChild(el)
  return el
}

// 部位ごとのレベル進捗バッジDOMを生成してroot配下に追加する
function createLevelBadge(root) {
  if (!root) return null

  const el = document.createElement("div")
  el.className = "avatar-level-badge"

  badgeRowEls = {}

  PART_ORDER.forEach((part) => {
    const row = document.createElement("div")
    row.className = "avatar-level-row"

    const label = document.createElement("span")
    label.className = "avatar-level-row__label"
    label.textContent = formatPartLabel(part)

    const level = document.createElement("span")
    level.className = "avatar-level-row__level"

    const bar = document.createElement("div")
    bar.className = "avatar-level-row__bar"

    const fill = document.createElement("div")
    fill.className = "avatar-level-row__bar-fill"
    bar.appendChild(fill)

    const percent = document.createElement("span")
    percent.className = "avatar-level-row__percent"

    row.append(label, level, bar, percent)
    el.appendChild(row)

    badgeRowEls[part] = { levelEl: level, fillEl: fill, percentEl: percent }
  })

  root.appendChild(el)
  return el
}

// 現在のavatarLevelsを進捗バッジへ反映する
function updateLevelBadge() {
  if (!badgeEl) return

  PART_ORDER.forEach((part) => {
    const rowEls = badgeRowEls[part]
    const stat = avatarLevels[part]
    if (!rowEls || !stat) return

    rowEls.levelEl.textContent = formatLevelLabel(stat.level)
    rowEls.percentEl.textContent = formatPercentLabel(stat)
    rowEls.fillEl.style.width = `${Math.round((stat.progress ?? 0) * 100)}%`
  })
}

// ローディング中/エラー発生時の表示を切り替える
// mode: "loading" | "error" | "hidden"
function setAvatarStatus(mode, message = "") {
  if (!statusEl) return

  if (mode === "hidden") {
    statusEl.style.display = "none"
    return
  }

  statusEl.style.display = "flex"
  statusEl.textContent = message
}

// 指定部位のラベル・レベル・進捗をツールチップに表示する
function showTooltip(part, event) {
  if (!tooltipEl) return

  const stat = avatarLevels[part]
  const partLabel = formatPartLabel(part)
  const levelLabel = formatLevelLabel(stat?.level)
  const percentLabel = formatPercentLabel(stat)

  tooltipEl.textContent = `${partLabel} ${levelLabel}${percentLabel ? ` (${percentLabel})` : ""}`
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

  statusEl?.remove()
  statusEl = null

  badgeEl?.remove()
  badgeEl = null
  badgeRowEls = {}

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
