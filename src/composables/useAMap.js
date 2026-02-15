import { shallowRef, onUnmounted } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'

const AMAP_KEY = '7983d4f184c7e6bb01292e449c0586f4'
const AMAP_VERSION = '2.0'

/**
 * useAMap composable — 管理高德地图实例
 * @returns {{ map, load, flyTo, addMarkers, clearMarkers, addHeatmap, removeHeatmap, destroy }}
 */
export function useAMap() {
  const map = shallowRef(null)
  let AMap = null
  let markerLayer = []
  let heatmapInstance = null

  async function load(container, options = {}) {
    AMap = await AMapLoader.load({
      key: AMAP_KEY,
      version: AMAP_VERSION,
      plugins: [
        'AMap.Scale',
        'AMap.HeatMap',
        'AMap.DistrictSearch',
        'AMap.Geocoder',
        'AMap.MarkerCluster',
      ],
    })

    map.value = new AMap.Map(container, {
      zoom: options.zoom || 5,
      center: options.center || [104.06, 34.75], // 中国中心
      mapStyle: 'amap://styles/blue', // 深蓝夜间风格
      viewMode: '2D',
      resizeEnable: true,
      ...options,
    })

    // 添加比例尺
    map.value.addControl(new AMap.Scale())
    return map.value
  }

  function flyTo(center, zoom = 12) {
    if (!map.value) return
    map.value.setZoomAndCenter(zoom, center, true, 800)
  }

  function addMarkers(points) {
    if (!map.value || !AMap) return
    clearMarkers()

    const colorMap = {
      disease: '#F43F5E',
      crop: '#10B981',
      weather: '#06B6D4',
    }

    points.forEach((p) => {
      const color = colorMap[p.type] || '#10B981'
      const marker = new AMap.Marker({
        position: [p.lng, p.lat],
        content: `<div style="
          width:12px;height:12px;border-radius:50%;
          background:${color};
          box-shadow:0 0 8px ${color};
          border:2px solid rgba(255,255,255,0.8);
        "></div>`,
        offset: new AMap.Pixel(-6, -6),
        extData: p,
      })

      marker.on('click', () => {
        const info = new AMap.InfoWindow({
          content: `<div style="padding:8px;min-width:160px;color:#333;font-size:13px;">
            <strong>${p.name}</strong><br/>
            <span style="color:#666">${p.description || ''}</span>
          </div>`,
          offset: new AMap.Pixel(0, -16),
        })
        info.open(map.value, marker.getPosition())
      })

      map.value.add(marker)
      markerLayer.push(marker)
    })
  }

  function clearMarkers() {
    markerLayer.forEach((m) => map.value?.remove(m))
    markerLayer = []
  }

  function addHeatmap(data) {
    if (!map.value || !AMap) return
    removeHeatmap()
    heatmapInstance = new AMap.HeatMap(map.value, {
      radius: 30,
      opacity: [0, 0.8],
      gradient: {
        0.2: '#0ff5a0',
        0.4: '#06B6D4',
        0.6: '#F59E0B',
        0.8: '#F43F5E',
      },
    })
    heatmapInstance.setDataSet({ data, max: 100 })
  }

  function removeHeatmap() {
    if (heatmapInstance) {
      heatmapInstance.setMap(null)
      heatmapInstance = null
    }
  }

  function destroy() {
    clearMarkers()
    removeHeatmap()
    map.value?.destroy()
    map.value = null
  }

  onUnmounted(() => destroy())

  return { map, load, flyTo, addMarkers, clearMarkers, addHeatmap, removeHeatmap, destroy }
}
