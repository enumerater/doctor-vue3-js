<template>
    <div class="disease-detection-page">
        <!-- 顶部导航栏 -->
        <van-nav-bar title="病虫害识别" left-arrow @click-left="$router.back()" />

        <!-- 上传区域 -->
        <div class="upload-section">
            <h2 class="section-title">上传作物图片</h2>
            <van-uploader v-model="fileList" multiple accept="image/*" :max-count="1" :before-read="beforeRead"
                preview-image @delete="handleDelete" :after-read="afterRead" />

            <!-- 识别按钮 -->
            <van-button type="primary" class="detect-btn" @click="handleDetect" :loading="isLoading"
                :disabled="fileList.length === 0">
                {{ isLoading ? '识别中...' : '开始病虫害识别' }}
            </van-button>
        </div>

        <!-- 识别结果区域（优化后） -->
        <div class="result-section" v-if="message">
            <h3 class="result-title">识别结果</h3>
            <Markdown :source="message" class="result-content" />
        </div>

        <!-- 功能说明 -->
        <div class="info-section">
            <p>请上传作物叶片、果实等部位的清晰图片，系统将为您识别病虫害类型并提供防治建议。</p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'
// 导入Markdown解析组件
import Markdown from 'vue3-markdown-it'
import { upload } from '@/axios/common'

// 响应式变量
const imageUrl = ref('https://enumerate-oss.oss-cn-qingdao.aliyuncs.com/77f5e9d8-bab3-4026-ae21-726a3d513701.jpg')
const fileList = ref([
    {
        name: 'file',
        url: imageUrl.value,
    }
])
const isLoading = ref(false) // 识别加载状态
const message = ref("") // 识别结果


// 读取图片前的校验
const beforeRead = (file) => {
    const isImage = file.type.includes('image')
    if (!isImage) {
        showToast('请选择图片文件')
        return false
    }

    // 限制图片大小（可选，根据需求调整）
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
        showToast('图片大小不能超过5MB')
        return false
    }
    return true
}

const afterRead = async (file) => {
    try {
        const formData = new FormData()
        formData.append('file', file.file)
        const res = await upload(formData)
        if (res.code === 1) {
            console.log(res.data)
            imageUrl.value = res.data
        }
    } catch (error) {
        console.error('上传失败：', error)
        showToast('图片不符合，请重试') // 给用户明确反馈
    }
}

// 处理文件删除（清空结果）
const handleDelete = () => {
    message.value = ""
}

// 触发病虫害识别
const handleDetect = async () => {
    isLoading.value = true;
    try {
        // 构建带查询参数的URL（参数名必须与后端一致：image_url）
        const url = 'http://localhost:8888/scan' + '?image_url=' + imageUrl.value; // 用localhost而非0.0.0.0（浏览器不识别0.0.0.0）

        // 发送GET请求
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // 5. 处理响应
        if (!response.ok) {
            throw new Error(`请求失败：${response.statusText}`)
        }

        const result = await response.json()
        console.log('识别结果：', result)

        // 6. 存储结果（假设后端返回格式为{ result: "xxx**yyy**zzz" }）
        message.value = result.result || "未识别到有效信息"

    } catch (error) {
        console.error('识别失败：', error)
        showToast('识别失败，请重试') // 给用户明确反馈
        message.value = "" // 清空错误结果
    } finally {
        isLoading.value = false
    }
}


</script>

<style scoped>
.disease-detection-page {
    background-color: #f8faf7;
    min-height: 100vh;
}

.upload-section {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
}

.section-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
}

.detect-btn {
    width: 100%;
    margin-top: 12px;
    background-color: #42b983;
    border-color: #42b983;
}

/* 结果区域样式优化 */
.result-section {
    background-color: #fff;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
}

.result-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
}

.result-content {
    font-size: 15px;
    line-height: 1.6;
    color: #555;
}

/* Markdown加粗样式优化 */
.result-content strong {
    color: #e53e3e;
    /* 用醒目颜色突出加粗内容 */
    font-weight: 700;
}

.info-section {
    background-color: #fff;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    color: #666;
    font-size: 14px;
    line-height: 1.5;
}
</style>