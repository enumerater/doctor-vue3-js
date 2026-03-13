<template>
  <div ref="containerRef" class="twin-scene" @click="onCanvasClick" @mousemove="onCanvasMove"></div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, shallowRef } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import { healthToColor, CROP_EMOJI } from '@/axios/farm_twin'

const props = defineProps({
  layoutData: { type: Object, default: null },
  iotData: { type: Object, default: () => ({}) },
  selectedPlotId: { type: String, default: null },
})

const emit = defineEmits(['plot-click'])

const containerRef = ref(null)

// Three.js 核心对象 — shallowRef 避免深层代理
const scene = shallowRef(null)
const camera = shallowRef(null)
const renderer = shallowRef(null)
const labelRenderer = shallowRef(null)
const controls = shallowRef(null)
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

let animId = null
let plotMeshes = [] // { plotId, mesh, edges, label }
let hoveredMesh = null

// ====== 初始化场景 ======
function initScene() {
  const el = containerRef.value
  if (!el) return
  const w = el.clientWidth
  const h = el.clientHeight

  // Scene
  const s = new THREE.Scene()
  s.background = new THREE.Color(0xe8f5e9)
  s.fog = new THREE.Fog(0xe8f5e9, 200, 400)
  scene.value = s

  // Camera
  const cam = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000)
  cam.position.set(0, 100, 120)
  cam.lookAt(0, 0, 0)
  camera.value = cam

  // WebGL Renderer
  const r = new THREE.WebGLRenderer({ antialias: true })
  r.setSize(w, h)
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  r.shadowMap.enabled = true
  r.shadowMap.type = THREE.PCFSoftShadowMap
  el.appendChild(r.domElement)
  renderer.value = r

  // CSS2D Renderer (HTML labels overlay)
  const lr = new CSS2DRenderer()
  lr.setSize(w, h)
  lr.domElement.style.position = 'absolute'
  lr.domElement.style.top = '0'
  lr.domElement.style.left = '0'
  lr.domElement.style.pointerEvents = 'none'
  el.appendChild(lr.domElement)
  labelRenderer.value = lr

  // Controls
  const ctrl = new OrbitControls(cam, r.domElement)
  ctrl.enableDamping = true
  ctrl.dampingFactor = 0.08
  ctrl.maxPolarAngle = Math.PI / 2.2
  ctrl.minDistance = 30
  ctrl.maxDistance = 250
  ctrl.target.set(0, 0, 0)
  controls.value = ctrl

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.6)
  s.add(ambient)
  const directional = new THREE.DirectionalLight(0xffffff, 0.8)
  directional.position.set(50, 80, 50)
  directional.castShadow = true
  directional.shadow.mapSize.set(1024, 1024)
  s.add(directional)

  // Ground
  buildGround(s)

  // Decorations
  buildDecorations(s)
}

// ====== 地面 ======
function buildGround(s) {
  const gw = props.layoutData?.groundSize?.width || 160
  const gd = props.layoutData?.groundSize?.depth || 120

  // 主地面
  const groundGeo = new THREE.PlaneGeometry(gw + 60, gd + 60)
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x7cb342, roughness: 0.9 })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.1
  ground.receiveShadow = true
  s.add(ground)

  // 网格线
  const gridHelper = new THREE.GridHelper(Math.max(gw, gd) + 40, 20, 0x66a03a, 0x66a03a)
  gridHelper.material.opacity = 0.15
  gridHelper.material.transparent = true
  gridHelper.position.y = 0.01
  s.add(gridHelper)
}

// ====== 装饰（树木、围栏） ======
function buildDecorations(s) {
  const gw = (props.layoutData?.groundSize?.width || 160) / 2
  const gd = (props.layoutData?.groundSize?.depth || 120) / 2

  // 角落树木
  const treePositions = [
    [gw + 15, gd + 15],
    [-gw - 15, gd + 15],
    [gw + 15, -gd - 15],
    [-gw - 15, -gd - 15],
    [gw + 15, 0],
    [-gw - 15, 0],
  ]

  treePositions.forEach(([x, z]) => {
    // 树干
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.2, 6, 8),
      new THREE.MeshStandardMaterial({ color: 0x8d6e63 }),
    )
    trunk.position.set(x, 3, z)
    trunk.castShadow = true
    s.add(trunk)

    // 树冠
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(5, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0x388e3c }),
    )
    crown.position.set(x, 11, z)
    crown.castShadow = true
    s.add(crown)
  })

  // 围栏（简单的线段）
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0xa1887f })
  const posts = [
    [-gw - 5, -gd - 5], [-gw - 5, 0], [-gw - 5, gd + 5],
    [gw + 5, -gd - 5], [gw + 5, 0], [gw + 5, gd + 5],
  ]
  posts.forEach(([x, z]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 4, 6), fenceMat)
    post.position.set(x, 2, z)
    s.add(post)
  })
}

// ====== 构建地块 Mesh ======
function buildPlots() {
  if (!scene.value || !props.layoutData) return

  // 清除旧 mesh
  clearPlots()

  props.layoutData.plots.forEach((plot) => {
    const color = healthToColor(plot.healthScore)
    const w = plot.size.width
    const d = plot.size.depth
    const h = 3

    // 地块方块
    const geo = new THREE.BoxGeometry(w, h, d)
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.85,
      roughness: 0.6,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(plot.position.x, h / 2, plot.position.z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.userData = { plotId: plot.plotId }
    scene.value.add(mesh)

    // 描边
    const edgesGeo = new THREE.EdgesGeometry(geo)
    const edgesMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })
    const edges = new THREE.LineSegments(edgesGeo, edgesMat)
    edges.position.copy(mesh.position)
    scene.value.add(edges)

    // CSS2D 标签
    const labelDiv = document.createElement('div')
    labelDiv.className = 'twin-plot-label'
    const emoji = CROP_EMOJI[plot.cropType] || '🌱'
    labelDiv.innerHTML = `<span class="emoji">${emoji}</span><span class="name">${plot.plotName}</span>`
    const label = new CSS2DObject(labelDiv)
    label.position.set(plot.position.x, h + 2, plot.position.z)
    scene.value.add(label)

    plotMeshes.push({ plotId: plot.plotId, mesh, edges, label })
  })
}

function clearPlots() {
  plotMeshes.forEach(({ mesh, edges, label }) => {
    scene.value.remove(mesh)
    scene.value.remove(edges)
    scene.value.remove(label)
    mesh.geometry.dispose()
    mesh.material.dispose()
    edges.geometry.dispose()
    edges.material.dispose()
    if (label.element && label.element.parentNode) {
      label.element.parentNode.removeChild(label.element)
    }
  })
  plotMeshes = []
}

// ====== 更新地块颜色 ======
function updatePlotColors() {
  if (!props.layoutData) return
  props.layoutData.plots.forEach((plot) => {
    const entry = plotMeshes.find((pm) => pm.plotId === plot.plotId)
    if (entry) {
      entry.mesh.material.color.set(healthToColor(plot.healthScore))
    }
  })
}

// ====== 选中高亮 ======
function updateSelection() {
  plotMeshes.forEach(({ plotId, mesh, edges }) => {
    const selected = plotId === props.selectedPlotId
    edges.material.color.set(selected ? 0xffd600 : 0xffffff)
    edges.material.opacity = selected ? 1 : 0.3
    mesh.material.opacity = selected ? 1 : 0.85
  })
}

// ====== 相机飞向地块 ======
function focusPlot(plotId) {
  const entry = plotMeshes.find((pm) => pm.plotId === plotId)
  if (!entry || !camera.value || !controls.value) return

  const target = entry.mesh.position.clone()
  const camTarget = target.clone().add(new THREE.Vector3(30, 40, 30))

  // 平滑动画
  const startPos = camera.value.position.clone()
  const startTarget = controls.value.target.clone()
  const duration = 800
  const startTime = performance.now()

  function animate(now) {
    const t = Math.min((now - startTime) / duration, 1)
    const ease = 1 - Math.pow(1 - t, 3) // easeOutCubic
    camera.value.position.lerpVectors(startPos, camTarget, ease)
    controls.value.target.lerpVectors(startTarget, target, ease)
    controls.value.update()
    if (t < 1) requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}

// ====== Raycaster 交互 ======
function getMousePos(e) {
  const rect = containerRef.value.getBoundingClientRect()
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
}

function onCanvasClick(e) {
  getMousePos(e)
  raycaster.setFromCamera(mouse, camera.value)
  const meshes = plotMeshes.map((pm) => pm.mesh)
  const hits = raycaster.intersectObjects(meshes)
  if (hits.length > 0) {
    const plotId = hits[0].object.userData.plotId
    emit('plot-click', plotId)
  }
}

function onCanvasMove(e) {
  getMousePos(e)
  raycaster.setFromCamera(mouse, camera.value)
  const meshes = plotMeshes.map((pm) => pm.mesh)
  const hits = raycaster.intersectObjects(meshes)

  // 重置旧 hover
  if (hoveredMesh && (!hits.length || hits[0].object !== hoveredMesh)) {
    hoveredMesh.material.emissive?.setHex(0x000000)
    containerRef.value.style.cursor = 'grab'
    hoveredMesh = null
  }

  if (hits.length > 0) {
    hoveredMesh = hits[0].object
    hoveredMesh.material.emissive?.setHex(0x333333)
    containerRef.value.style.cursor = 'pointer'
  }
}

// ====== 动画循环 ======
let breathPhase = 0

function animate() {
  animId = requestAnimationFrame(animate)
  controls.value?.update()

  // 地块呼吸灯效果
  breathPhase += 0.02
  plotMeshes.forEach(({ mesh, plotId }) => {
    if (plotId !== props.selectedPlotId) {
      mesh.material.opacity = 0.8 + Math.sin(breathPhase) * 0.05
    }
  })

  renderer.value?.render(scene.value, camera.value)
  labelRenderer.value?.render(scene.value, camera.value)
}

// ====== Resize ======
function onResize() {
  const el = containerRef.value
  if (!el || !camera.value) return
  const w = el.clientWidth
  const h = el.clientHeight
  camera.value.aspect = w / h
  camera.value.updateProjectionMatrix()
  renderer.value?.setSize(w, h)
  labelRenderer.value?.setSize(w, h)
}

let resizeObs = null

// ====== 生命周期 ======
onMounted(() => {
  initScene()
  buildPlots()
  updateSelection()
  animate()

  resizeObs = new ResizeObserver(onResize)
  if (containerRef.value) resizeObs.observe(containerRef.value)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
  resizeObs?.disconnect()
  clearPlots()
  controls.value?.dispose()
  renderer.value?.dispose()
  // 移除 canvas DOM
  if (renderer.value?.domElement?.parentNode) {
    renderer.value.domElement.parentNode.removeChild(renderer.value.domElement)
  }
  if (labelRenderer.value?.domElement?.parentNode) {
    labelRenderer.value.domElement.parentNode.removeChild(labelRenderer.value.domElement)
  }
})

// ====== Watchers ======
watch(() => props.layoutData, () => {
  if (scene.value) {
    buildPlots()
    updateSelection()
  }
}, { deep: true })

watch(() => props.iotData, () => {
  updatePlotColors()
}, { deep: true })

watch(() => props.selectedPlotId, (id) => {
  updateSelection()
  if (id) focusPlot(id)
})

// 暴露方法
defineExpose({ focusPlot })
</script>

<style lang="scss" scoped>
.twin-scene {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}
</style>

<style>
/* CSS2D 标签样式（全局，因为 Three.js 在 scene root 下创建） */
.twin-plot-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  pointer-events: none;
  user-select: none;
}

.twin-plot-label .emoji {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.twin-plot-label .name {
  font-size: 12px;
  font-weight: 700;
  color: #2c3e35;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  padding: 2px 8px;
  border-radius: 6px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
