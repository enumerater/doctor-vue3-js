<template>
  <div class="graph-container" ref="container">
    <!-- 图谱画布 -->
    <svg ref="svgRef"></svg>

    <!-- 图谱搜索 -->
    <div class="graph-search">
      <el-autocomplete
        v-model="searchQuery"
        :fetch-suggestions="querySearch"
        placeholder="在图谱中搜索节点..."
        @select="handleSelect"
        clearable
        :prefix-icon="Search"
      >
        <template #default="{ item }">
          <div class="suggestion-item">
            <span class="name">{{ item.name }}</span>
            <el-tag size="small" :type="getTypeTag(item.type)" class="type-tag">{{ item.typeName }}</el-tag>
          </div>
        </template>
      </el-autocomplete>
    </div>

    <!-- 悬浮详情卡片 -->
    <transition name="fade">
      <div v-if="selectedNode" class="node-detail-panel">
        <div class="panel-header">
          <h3>{{ selectedNode.name }}</h3>
          <el-tag size="small" :type="getTypeTag(selectedNode.type)">{{ selectedNode.typeName }}</el-tag>
        </div>
        <p class="description">{{ selectedNode.details || '该节点包含了农业领域的核心知识，点击下方按钮可与 AI 深入探讨其在生产实践中的应用。' }}</p>
        <div class="actions">
          <el-button type="primary" size="default" :icon="ChatDotRound" @click="askAI(selectedNode.name)" class="ask-btn">
            针对该节点提问
          </el-button>
        </div>
        <el-button class="close-btn" link :icon="Close" @click="selectedNode = null" />
      </div>
    </transition>

    <!-- 图例 -->
    <div class="legend">
      <div v-for="item in legendItems" :key="item.type" class="legend-item">
        <span class="dot" :style="{ backgroundColor: item.color }"></span>
        {{ item.label }}
      </div>
    </div>

    <!-- 缩放控制 -->
    <div class="zoom-controls">
      <el-button-group>
        <el-button :icon="Plus" @click="handleZoom(1.2)" />
        <el-button :icon="Minus" @click="handleZoom(0.8)" />
        <el-button :icon="RefreshRight" @click="resetZoom" />
      </el-button-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as d3 from 'd3';
import { useRouter } from 'vue-router';
import { ChatDotRound, Close, Plus, Minus, RefreshRight, Search } from '@element-plus/icons-vue';
import { useKnowledgeStore } from '@/stores/knowledge';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({ nodes: [], links: [] })
  }
});

const store = useKnowledgeStore();
const svgRef = ref(null);
const container = ref(null);
const selectedNode = ref(null);
const searchQuery = ref('');
const router = useRouter();
let svg, g, simulation, zoomBehavior;

const legendItems = [
  { type: 'crop', label: '农作物', color: '#22c55e', typeName: '作物' },
  { type: 'pest', label: '病虫害', color: '#ef4444', typeName: '病害' },
  { type: 'pesticide', label: '农药', color: '#3b82f6', typeName: '药剂' },
  { type: 'symptom', label: '病症', color: '#8b5cf6', typeName: '症状' },
  { type: 'solar_term', label: '节气', color: '#f59e0b', typeName: '节气' }
];

const getTypeColor = (type) => {
  const item = legendItems.find(i => i.type === type);
  return item ? item.color : '#8b5cf6';
};

const getTypeTag = (type) => {
  const map = { crop: 'success', pest: 'danger', pesticide: '', symptom: 'info', solar_term: 'warning' };
  return map[type] || 'info';
};

// 搜索建议
const querySearch = async (queryString, cb) => {
  if (!queryString || queryString.trim() === '') {
    cb([]);
    return;
  }
  try {
    await store.fetchGraphSuggest(queryString, store.selectedGraphCrop);
    
    // 兼容处理：后端可能返回字符串数组或对象数组
    const results = (store.graphSuggestions || []).map(item => {
      const isString = typeof item === 'string';
      const name = isString ? item : (item.name || item.label || '未知节点');
      const type = isString ? '' : item.type;
      const id = isString ? null : item.id;

      return {
        ...(isString ? {} : item),
        id,
        name,
        value: name, // el-autocomplete 显示文字必须字段
        typeName: legendItems.find(i => i.type === type)?.typeName || 
                 (type === 'pest' || name.includes('病') ? '病害' : '知识点')
      };
    });
    cb(results);
  } catch (err) {
    console.error('搜索建议获取失败:', err);
    cb([]);
  }
};

const handleSelect = (item) => {
  if (!item) return;
  searchQuery.value = item.name; // 同步搜索框内容

  // 【优化】：优先通过 ID 匹配，ID 最为准确
  const node = d3.selectAll('.node-group').filter(d => {
    return d.id === item.id || d.name === item.name;
  });

  if (!node.empty()) {
    const d = node.datum();
    selectedNode.value = {
      ...d,
      typeName: legendItems.find(i => i.type === d.type)?.typeName || '知识点'
    };
    
    // 平滑缩放定位
    const width = container.value.clientWidth;
    const height = container.value.clientHeight || 600;
    const transform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(1.2) // 缩放倍数
      .translate(-d.x, -d.y);
    
    svg.transition()
      .duration(750)
      .ease(d3.easeCubicOut)
      .call(zoomBehavior.transform, transform);
  } else {
    console.warn('在当前画布中未找到该节点:', item.name);
  }
};

const initGraph = () => {
  if (!props.data.nodes || !props.data.nodes.length || !container.value) return;

  // 【优化 1】：数据清洗与自动补全
  let nodes = props.data.nodes.map(d => ({ ...d }));
  let links = (props.data.links || []).map(d => ({ ...d }));

  // 如果没有作物中心节点，自动创建一个
  const cropName = store.selectedGraphCrop || (nodes[0] && nodes[0].cropName);
  if (cropName && !nodes.some(n => n.type === 'crop')) {
    const cropId = `${cropName}_root`;
    nodes.unshift({
      id: cropId,
      name: cropName,
      type: 'crop',
      value: 40,
      details: `${cropName}知识图谱概览`
    });
    // 将所有病害连接到作物中心
    nodes.filter(n => n.type === 'pest').forEach(pest => {
      links.push({ source: cropId, target: pest.id, relation: '常见病害' });
    });
  }

  // 【关键修复】：过滤无效连接，防止 D3 报错崩溃
  const nodeIds = new Set(nodes.map(n => n.id));
  links = links.filter(l => {
    const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
    const targetId = typeof l.target === 'object' ? l.target.id : l.target;
    return nodeIds.has(sourceId) && nodeIds.has(targetId);
  });

  const width = container.value.clientWidth;
  const height = container.value.clientHeight || 600;

  // 清除旧内容
  d3.select(svgRef.value).selectAll('*').remove();

  zoomBehavior = d3.zoom()
    .scaleExtent([0.05, 8]) // 扩大缩放范围以适应大数据量
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg = d3.select(svgRef.value)
    .attr('width', '100%')
    .attr('height', height)
    .call(zoomBehavior);

  g = svg.append('g');

  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(150))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(d => (d.value || 20) + 10))
    .alphaDecay(0.05); // 加快仿真稳定速度

  // 绘制边
  const link = g.append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', '#cbd5e1')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', 1.5);

  // 绘制节点
  const node = g.append('g')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .attr('class', 'node-group')
    .call(drag(simulation))
    .on('click', (event, d) => {
      selectedNode.value = {
        ...d,
        typeName: legendItems.find(i => i.type === d.type)?.typeName || '知识点'
      };
      event.stopPropagation();
    });

  // 节点阴影
  const defs = svg.append('defs');
  const filter = defs.append('filter')
    .attr('id', 'drop-shadow')
    .attr('height', '130%');
  filter.append('feGaussianBlur')
    .attr('in', 'SourceAlpha')
    .attr('stdDeviation', 2);
  filter.append('feOffset')
    .attr('dx', 1)
    .attr('dy', 1);
  const feMerge = filter.append('feMerge');
  feMerge.append('feMergeNode');
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

  node.append('circle')
    .attr('r', d => d.value || 20)
    .attr('fill', d => getTypeColor(d.type))
    .attr('stroke', '#fff')
    .attr('stroke-width', 3)
    .style('filter', 'url(#drop-shadow)')
    .style('cursor', 'pointer');

  node.append('text')
    .text(d => d.name)
    .attr('x', 0)
    .attr('y', d => (d.value || 20) + 20)
    .attr('text-anchor', 'middle')
    .style('font-size', '13px')
    .style('font-weight', '500')
    .style('fill', '#334155')
    .style('pointer-events', 'none');

  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  svg.on('click', () => {
    selectedNode.value = null;
  });
};

const drag = (simulation) => {
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
  return d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
};

const handleZoom = (factor) => {
  svg.transition().duration(300).call(zoomBehavior.scaleBy, factor);
};

const resetZoom = () => {
  svg.transition().duration(500).call(zoomBehavior.transform, d3.zoomIdentity);
};

const askAI = (name) => {
  router.push({
    path: '/chat',
    query: { prompt: `请详细介绍一下关于"${name}"的专业知识，包括防治、栽培或相关注意事项。` }
  });
};

onMounted(() => {
  setTimeout(() => {
    initGraph();
  }, 100);
  window.addEventListener('resize', initGraph);
});

onUnmounted(() => {
  window.removeEventListener('resize', initGraph);
  if (simulation) simulation.stop();
});

watch(() => props.data, initGraph, { deep: true });
</script>

<style lang="scss" scoped>
.graph-container {
  position: relative;
  width: 100%;
  height: 600px;
  background: radial-gradient(circle at center, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);

  @include mobile {
    height: 500px;
  }

  svg {
    cursor: grab;
    touch-action: none; // 【优化 2】：解决 non-passive 警告，提升移动端响应速度
    &:active { cursor: grabbing; }
  }

  .node-detail-panel {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 300px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    padding: 24px;
    border-radius: 20px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.12);
    border: 1px solid rgba(255,255,255,0.5);
    z-index: 10;

    @include mobile {
      width: calc(100% - 40px);
      top: auto;
      bottom: 20px;
      right: 20px;
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      h3 { margin: 0; color: #1e293b; font-size: 18px; font-weight: 700; }
    }

    .description {
      font-size: 14px;
      color: #64748b;
      line-height: 1.6;
      margin: 0 0 24px 0;
    }

    .ask-btn {
      width: 100%;
      border-radius: 12px;
      height: 44px;
      font-weight: 600;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      border: none;
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
      }
    }

    .close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      color: #94a3b8;
      &:hover { color: #64748b; }
    }
  }

  .legend {
    position: absolute;
    bottom: 24px;
    left: 24px;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(8px);
    padding: 12px 20px;
    border-radius: 30px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border: 1px solid #f1f5f9;

    @include mobile {
      bottom: auto;
      top: 24px;
      left: 24px;
      padding: 8px 16px;
      gap: 12px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-right: 8px;
        box-shadow: 0 0 4px rgba(0,0,0,0.1);
      }
    }
  }

  .zoom-controls {
    position: absolute;
    bottom: 24px;
    right: 24px;
    @include mobile {
      display: none; // 移动端通常手势缩放，隐藏按钮
    }
    .el-button {
      background: rgba(255, 255, 255, 0.8);
      border-color: #f1f5f9;
      color: #64748b;
      &:hover { background: #fff; color: #1e293b; }
    }
  }
}

.node-group {
  transition: opacity 0.3s;
  &:hover {
    circle { stroke: #1e293b; stroke-width: 4px; }
  }
}

.graph-search {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 240px;
  z-index: 10;
  :deep(.el-input__wrapper) {
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
  @include mobile {
    width: 200px;
    top: 70px; // 避开移动端的图例或标题
    left: 16px;
  }
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .name { font-weight: 500; }
  .type-tag { margin-left: 8px; }
}

.fade-enter-active, .fade-leave-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(20px) scale(0.95); }
</style>
