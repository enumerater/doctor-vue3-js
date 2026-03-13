<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const props = defineProps({
  plots: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['select-plot']);

// 容器引用
const container = ref(null);
let scene, camera, renderer, controls, raycaster, mouse;
let plotMeshes = [];

// 模拟地块状态颜色
const STATUS_COLORS = {
  healthy: 0x2ecc71, // 翠绿
  warning: 0xf1c40f, // 警戒黄
  danger: 0xe74c3c,  // 干旱/病害红
  normal: 0x3498db   // 蓝色/待耕作
};

const initScene = () => {
  if (!container.value) return;

  // 1. 基础配置
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a192f'); 
  scene.fog = new THREE.FogExp2('#0a192f', 0.002); 

  const width = container.value.clientWidth;
  const height = container.value.clientHeight;

  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(60, 50, 60);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.value.appendChild(renderer.domElement);

  // 2. 光影设置
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0x00ffcc, 1.2); 
  dirLight.position.set(50, 100, 50);
  scene.add(dirLight);

  // 3. 控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2.1; 

  // 4. 辅助设施：地面网格
  const gridHelper = new THREE.GridHelper(300, 30, 0x00ffcc, 0x1a2a4a);
  gridHelper.position.y = -0.1;
  scene.add(gridHelper);

  // 5. 交互工具
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  render();
};

// 生成 3D 地块
const createPlots = () => {
  // 清理旧模型
  plotMeshes.forEach(m => scene.remove(m));
  plotMeshes = [];

  props.plots.forEach((plot, index) => {
    const geometry = new THREE.BoxGeometry(14, 4, 14);
    const material = new THREE.MeshPhongMaterial({
      color: STATUS_COLORS[plot.status] || STATUS_COLORS.normal,
      transparent: true,
      opacity: 0.85,
      shininess: 100,
      emissive: STATUS_COLORS[plot.status] || STATUS_COLORS.normal,
      emissiveIntensity: 0.2
    });

    const mesh = new THREE.Mesh(geometry, material);
    
    const col = index % 3;
    const row = Math.floor(index / 3);
    mesh.position.set(col * 24 - 24, 2, row * 24 - 24);
    
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.4 }));
    mesh.add(line);

    mesh.userData = plot; 
    scene.add(mesh);
    plotMeshes.push(mesh);

    // 植物占位符
    const plantGeo = new THREE.CylinderGeometry(1, 1, 4, 8);
    const plantMat = new THREE.MeshPhongMaterial({ color: 0x27ae60 });
    const plant = new THREE.Mesh(plantGeo, plantMat);
    plant.position.y = 4;
    mesh.add(plant);
  });
};

const onMouseClick = (event) => {
  if (!container.value) return;
  const rect = container.value.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / container.value.clientWidth) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / container.value.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(plotMeshes);

  if (intersects.length > 0) {
    const selectedMesh = intersects[0].object;
    focusOnPlot(selectedMesh);
    emit('select-plot', selectedMesh.userData);
  }
};

const focusOnPlot = (mesh) => {
  const startPos = camera.position.clone();
  const endPos = new THREE.Vector3(mesh.position.x + 25, 20, mesh.position.z + 25);
  const startTarget = controls.target.clone();
  const endTarget = new THREE.Vector3(mesh.position.x, 0, mesh.position.z);
  const duration = 1500;
  const startTime = performance.now();

  function animate(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic
    camera.position.lerpVectors(startPos, endPos, ease);
    controls.target.lerpVectors(startTarget, endTarget, ease);
    controls.update();
    if (t < 1) requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
};

const render = () => {
  if (!renderer) return;
  requestAnimationFrame(render);
  controls.update();
  
  const time = Date.now() * 0.001;
  plotMeshes.forEach((m, i) => {
    m.position.y = 2 + Math.sin(time + i) * 0.3;
  });
  
  renderer.render(scene, camera);
};

onMounted(() => {
  setTimeout(() => {
    initScene();
    createPlots();
  }, 100);
  window.addEventListener('resize', handleResize);
  container.value?.addEventListener('click', onMouseClick);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (renderer) {
    renderer.dispose();
  }
});

const handleResize = () => {
  if (!container.value || !camera || !renderer) return;
  const width = container.value.clientWidth;
  const height = container.value.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

watch(() => props.plots, () => {
  if (scene) createPlots();
}, { deep: true });
</script>

<template>
  <div ref="container" class="three-container">
    <div class="hud-hint">
       点击地块查看详情 | 右键旋转视角 | 滚轮缩放
    </div>
  </div>
</template>

<style scoped lang="scss">
.three-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  background: radial-gradient(circle at center, #1a2a4a 0%, #0a192f 100%);

  .hud-hint {
    position: absolute;
    bottom: 24px;
    left: 24px;
    color: #00ffcc;
    font-size: 13px;
    pointer-events: none;
    background: rgba(10, 25, 47, 0.7);
    padding: 8px 16px;
    border-radius: 30px;
    border: 1px solid rgba(0, 255, 204, 0.2);
    backdrop-filter: blur(4px);
    z-index: 5;
  }
}
</style>
