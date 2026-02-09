<template>
  <div class="advanced-config-section">
    <div class="form-section">
      <h3 class="section-title">高级配置</h3>

      <!-- Caching Configuration -->
      <div class="param-group">
        <van-cell center title="启用缓存">
          <template #right-icon>
            <van-switch v-model="cachingEnabled" size="20" />
          </template>
        </van-cell>
        <div v-if="cachingEnabled" class="sub-config">
          <van-field
            v-model="cacheExpireValue"
            type="number"
            label="缓存过期时间"
            placeholder="60"
            input-align="right"
          >
            <template #button>
              <span class="unit">分钟</span>
            </template>
          </van-field>
          <p class="hint">缓存可加快重复请求的响应速度</p>
        </div>
      </div>

      <!-- Retry Configuration -->
      <div class="param-group">
        <van-cell center title="启用重试机制">
          <template #right-icon>
            <van-switch v-model="retryEnabled" size="20" />
          </template>
        </van-cell>
        <div v-if="retryEnabled" class="sub-config">
          <van-field
            v-model="maxRetriesValue"
            type="number"
            label="最大重试次数"
            placeholder="3"
            input-align="right"
          >
            <template #button>
              <span class="unit">次</span>
            </template>
          </van-field>
          <van-field
            v-model="retryDelayValue"
            type="number"
            label="重试延迟"
            placeholder="1000"
            input-align="right"
          >
            <template #button>
              <span class="unit">毫秒</span>
            </template>
          </van-field>
          <p class="hint">请求失败时会自动重试</p>
        </div>
      </div>

      <!-- Timeout Configuration -->
      <div class="param-group">
        <label class="label">请求超时时间</label>
        <p class="description">设置Agent响应的最大等待时间</p>
        <van-field
          v-model="timeoutValue"
          type="number"
          placeholder="60"
          input-align="right"
        >
          <template #button>
            <span class="unit">秒</span>
          </template>
        </van-field>
        <div class="timeout-presets">
          <van-button
            v-for="preset in timeoutPresets"
            :key="preset.value"
            size="small"
            plain
            :type="timeoutValue == preset.value ? 'primary' : 'default'"
            @click="timeoutValue = preset.value"
          >
            {{ preset.label }}
          </van-button>
        </div>
      </div>

      <!-- Connection Configuration -->
      <div class="param-group">
        <label class="label">连接配置</label>
        <van-cell center title="保持连接活跃">
          <template #right-icon>
            <van-switch v-model="keepAlive" size="20" />
          </template>
        </van-cell>
        <van-cell center title="启用压缩">
          <template #right-icon>
            <van-switch v-model="enableCompression" size="20" />
          </template>
        </van-cell>
        <p class="hint">优化网络传输效率</p>
      </div>

      <!-- Reset to Defaults -->
      <div class="reset-section">
        <van-button
          block
          plain
          type="warning"
          @click="resetToDefaults"
        >
          恢复默认配置
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { showConfirmDialog, showToast } from 'vant'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const timeoutPresets = [
  { label: '30秒', value: 30 },
  { label: '60秒', value: 60 },
  { label: '120秒', value: 120 },
  { label: '180秒', value: 180 }
]

const cachingEnabled = computed({
  get() {
    return props.modelValue.enableCaching ?? true
  },
  set(value) {
    emit('update:modelValue', {
      ...props.modelValue,
      enableCaching: value
    })
  }
})

const cacheExpireValue = computed({
  get() {
    return String(props.modelValue.cacheExpireMins || 60)
  },
  set(value) {
    const num = parseInt(value) || 60
    emit('update:modelValue', {
      ...props.modelValue,
      cacheExpireMins: num
    })
  }
})

const retryEnabled = computed({
  get() {
    return props.modelValue.enableRetry ?? true
  },
  set(value) {
    emit('update:modelValue', {
      ...props.modelValue,
      enableRetry: value
    })
  }
})

const maxRetriesValue = computed({
  get() {
    return String(props.modelValue.maxRetries || 3)
  },
  set(value) {
    const num = parseInt(value) || 3
    emit('update:modelValue', {
      ...props.modelValue,
      maxRetries: num
    })
  }
})

const retryDelayValue = computed({
  get() {
    return String(props.modelValue.retryDelayMs || 1000)
  },
  set(value) {
    const num = parseInt(value) || 1000
    emit('update:modelValue', {
      ...props.modelValue,
      retryDelayMs: num
    })
  }
})

const timeoutValue = computed({
  get() {
    return String(props.modelValue.timeoutSeconds || 60)
  },
  set(value) {
    const num = parseInt(value) || 60
    emit('update:modelValue', {
      ...props.modelValue,
      timeoutSeconds: num
    })
  }
})

const keepAlive = computed({
  get() {
    return props.modelValue.keepAlive ?? true
  },
  set(value) {
    emit('update:modelValue', {
      ...props.modelValue,
      keepAlive: value
    })
  }
})

const enableCompression = computed({
  get() {
    return props.modelValue.enableCompression ?? true
  },
  set(value) {
    emit('update:modelValue', {
      ...props.modelValue,
      enableCompression: value
    })
  }
})

const resetToDefaults = async () => {
  try {
    await showConfirmDialog({
      title: '确认重置',
      message: '将恢复所有高级配置到默认值，确定继续吗？'
    })

    emit('update:modelValue', {
      enableCaching: true,
      cacheExpireMins: 60,
      enableRetry: true,
      maxRetries: 3,
      retryDelayMs: 1000,
      timeoutSeconds: 60,
      keepAlive: true,
      enableCompression: true
    })

    showToast({
      message: '已恢复默认配置',
      position: 'top'
    })
  } catch {
    // User cancelled
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.advanced-config-section {
  .form-section {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .section-title {
      margin: 0;
      padding: 12px 0 0 0;
      font-size: 14px;
      font-weight: 600;
      color: $text-primary;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .param-group {
      padding: 12px;
      background: $bg-card;
      border-radius: $radius-md;
      border: 1px solid $border;

      .label {
        display: block;
        font-weight: 600;
        font-size: 14px;
        color: $text-primary;
        margin-bottom: 8px;
      }

      .description {
        margin: 0 0 12px 0;
        font-size: 12px;
        color: $text-secondary;
        line-height: 1.4;
      }

      :deep(.van-cell) {
        padding: 8px 0;
        border-bottom: 1px solid $border;

        &:last-child {
          border-bottom: none;
        }
      }

      .sub-config {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid $border;

        :deep(.van-field) {
          padding: 8px 0;
        }

        .unit {
          color: $text-secondary;
          font-size: 13px;
          margin-left: 8px;
        }
      }

      .hint {
        margin: 8px 0 0 0;
        font-size: 11px;
        color: $text-secondary;
        font-style: italic;
      }

      .timeout-presets {
        display: flex;
        gap: 8px;
        margin-top: 12px;
        flex-wrap: wrap;

        :deep(.van-button) {
          flex: 1;
          min-width: 60px;
        }
      }
    }

    .reset-section {
      margin-top: 8px;
    }
  }
}
</style>
