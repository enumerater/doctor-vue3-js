<template>
    <div class="disease-detection-container">
        <!-- 极简返回按钮导航栏 -->
        <nav class="nav-header">
            <div class="nav-container">
                <button class="back-btn" @click="goBack">
                    <svg class="back-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <span class="back-text">返回</span>
                </button>
            </div>
        </nav>

        <!-- 核心内容区 -->
        <main class="main-content">
            <!-- 上传区域 -->
            <section class="upload-section">
                <div class="upload-card">
                    <h2 class="card-title">
                        上传检测图片
                    </h2>
                    <div class="upload-area" @click="triggerFileInput" @drop="handleDrop" @dragover="handleDragOver"
                        @dragleave="handleDragLeave" :class="{ 'upload-area--dragging': isDragging }">

                        <div v-if="!uploadedImage" class="upload-placeholder">
                            <div class="upload-icon-wrapper">
                                <svg class="upload-icon" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M19 5L12 12L5 5" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </div>
                            <p class="upload-desc">点击或拖拽图片至此处上传</p>
                            <p class="upload-tip">支持 JPG、PNG 格式，最大 5MB</p>
                        </div>

                        <div v-else class="image-preview">
                            <img :src="uploadedImage" alt="上传的病害图片" class="preview-img">
                            <button class="remove-img-btn" @click="clearImage">×</button>
                        </div>

                        <input type="file" ref="fileInput" class="file-input" accept="image/jpeg,image/png"
                            @change="handleFileChange">
                    </div>

                    <button class="detect-btn" @click="showCropSelect = true" :disabled="!uploadedImage || isDetecting">
                        <span v-if="!isDetecting">
                            开始识别
                        </span>
                        <span v-else class="loading">
                            <span class="loading-dot"></span>
                            <span class="loading-dot"></span>
                            <span class="loading-dot"></span>
                            识别中
                        </span>
                    </button>
                </div>
            </section>

            <!-- 识别结果 -->
            <section class="result-section" v-if="diseaseResult">
                <div class="result-card">
                    <h2 class="card-title">
                        <!-- <span class="title-icon">📊</span> -->
                        识别结果
                    </h2>

                    <!-- 结果头部 -->
                    <div class="result-header">
                        <h3 class="disease-name">{{ diseaseResult.name }}</h3>
                        <div class="confidence-tag">
                            <!-- <span class="tag-icon">✅</span> -->
                            置信度：{{ (diseaseResult.confidence * 100).toFixed(2) }}%
                        </div>
                    </div>

                    <!-- 结果详情 -->
                    <div class="result-details">
                        <div class="detail-item">
                            <div class="detail-header">
                                <!-- <span class="detail-icon">🌾</span> -->
                                <h4 class="detail-label">作物类型</h4>
                            </div>
                            <p class="detail-value">{{ selectedCrop || '未知' }}</p>
                        </div>
                        <div class="detail-item">
                            <div class="detail-header">
                                <!-- <span class="detail-icon">📋</span> -->
                                <h4 class="detail-label">病害类型</h4>
                            </div>
                            <p class="detail-value">{{ diseaseResult.type }}</p>
                        </div>

                        <div class="detail-item">
                            <div class="detail-header">
                                <!-- <span class="detail-icon">📝</span> -->
                                <h4 class="detail-label">症状描述</h4>
                            </div>
                            <p class="detail-value">{{ diseaseResult.description }}</p>
                        </div>

                        <div class="detail-item">
                            <div class="detail-header">
                                <!-- <span class="detail-icon">💡</span> -->
                                <h4 class="detail-label">防治建议</h4>
                            </div>
                            <ul class="prevention-list">
                                <li v-for="(item, index) in diseaseResult.prevention" :key="index">
                                    <span class="list-icon">▸</span>
                                    {{ item }}
                                </li>
                            </ul>
                        </div>
                    </div>

                    <button class="reset-btn" @click="resetAll">
                        <!-- <span class="reset-icon">🔄</span> -->
                        重新检测
                    </button>
                </div>
            </section>
        </main>

        <!-- 作物选择弹窗 -->
        <div class="crop-select-modal" v-if="showCropSelect">
            <div class="modal-mask" @click="showCropSelect = false"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">选择作物类型</h3>
                    <button class="modal-close" @click="showCropSelect = false">×</button>
                </div>
                <div class="modal-body">
                    <div class="crop-grid">
                        <!-- 常见农作物选项 -->
                        <div class="crop-item" v-for="(crop, index) in cropList" :key="index"
                            :class="{ active: selectedCrop === crop.name }" @click="selectedCrop = crop.name">
                            <span class="crop-icon">{{ crop.icon }}</span>
                            <span class="crop-name">{{ crop.name }}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-cancel" @click="showCropSelect = false">取消</button>
                    <button class="modal-confirm" @click="confirmCropSelect" :disabled="!selectedCrop">
                        确认识别
                    </button>
                </div>
            </div>
        </div>

        <!-- 页脚
        <footer class="page-footer">
            <p>© 2026 农智问答 · 专业农业病害检测工具</p>
        </footer> -->
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// 路由实例
const router = useRouter();

// 响应式数据
const fileInput = ref(null);
const uploadedImage = ref('');
const isDragging = ref(false);
const isDetecting = ref(false);
const diseaseResult = ref(null);
// 新增：作物选择相关
const showCropSelect = ref(false); // 控制弹窗显示
const selectedCrop = ref(''); // 选中的作物类型
// 作物列表
const cropList = ref([
    { icon: '🌾', name: '小麦' },
    { icon: '🌽', name: '玉米' },
    { icon: '🍚', name: '水稻' },
    { icon: '🥬', name: '蔬菜' },
    { icon: '🍎', name: '果树' },
    { icon: '🍞', name: '大麦' },
    { icon: '🥜', name: '花生' },
    { icon: '🍠', name: '红薯' },
    { icon: '🫘', name: '大豆' },
    { icon: '🍇', name: '葡萄' }
]);

// 返回上一页
const goBack = () => {
    router.go(-1);
};

// 触发文件选择
const triggerFileInput = () => {
    fileInput.value.click();
};

// 处理文件选择
const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFileUpload(file);
    }
};

// 文件上传处理
const handleFileUpload = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
        alert('仅支持上传 JPG/PNG 格式的图片！');
        return;
    }

    if (file.size > maxSize) {
        alert('图片大小不能超过 5MB！');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedImage.value = e.target.result;
        diseaseResult.value = null;
    };
    reader.readAsDataURL(file);
};

// 拖拽事件处理
const handleDragOver = (e) => {
    e.preventDefault();
    isDragging.value = true;
};

const handleDragLeave = () => {
    isDragging.value = false;
};

const handleDrop = (e) => {
    e.preventDefault();
    isDragging.value = false;
    const file = e.dataTransfer.files[0];
    if (file) {
        handleFileUpload(file);
    }
};

// 清空图片
const clearImage = () => {
    uploadedImage.value = '';
    diseaseResult.value = null;
    selectedCrop.value = ''; // 清空选中的作物
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};

// 确认作物选择并开始识别
const confirmCropSelect = () => {
    showCropSelect.value = false;
    detectDisease();
};

// 病害识别逻辑（新增作物类型参数）
const detectDisease = async () => {
    isDetecting.value = true;
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 模拟识别结果（可根据选中的作物类型返回不同结果）
    let result = {
        name: '小麦条锈病',
        type: '真菌性病害',
        confidence: 0.987,
        description: '小麦条锈病主要危害叶片，其次是叶鞘和茎秆，穗部、颖壳及芒也可受害。发病初期，叶片上出现褪绿斑点，以后形成鲜黄色的粉疱，即夏孢子堆。夏孢子堆较小，长椭圆形，与叶脉平行排列成虚线状，像缝纫机轧过的针脚一样，呈黄色条形，故称条锈病。',
        prevention: [
            '选用抗病品种：如济麦44、鲁原502等抗锈病品种',
            '农业防治：合理施肥，避免偏施氮肥，适当增施磷钾肥，提高植株抗病能力',
            '化学防治：发病初期喷施三唑类杀菌剂（如三唑酮、戊唑醇），间隔7-10天喷一次，连续喷2-3次',
            '加强田间管理：及时清除病残体，减少菌源；合理灌溉，避免田间湿度过大'
        ]
    };

    // 根据选中的作物类型调整模拟结果
    if (selectedCrop.value === '玉米') {
        result = {
            name: '玉米大斑病',
            type: '真菌性病害',
            confidence: 0.975,
            description: '玉米大斑病主要危害叶片，也可危害叶鞘和苞叶。发病初期，叶片上出现水渍状青灰色斑点，以后沿叶脉向两端扩展，形成边缘暗褐色、中央淡褐色或青灰色的大斑。病斑大小可达10-20厘米，严重时病斑融合，叶片变黄枯死。',
            prevention: [
                '选用抗病品种：如农大108、郑单958等抗病品种',
                '农业防治：清除田间病残体，实行轮作，合理密植，增施磷钾肥',
                '化学防治：发病初期喷施百菌清、多菌灵等杀菌剂，7-10天喷一次，连喷2-3次',
                '加强田间管理：及时排水，降低田间湿度，避免偏施氮肥'
            ]
        };
    } else if (selectedCrop.value === '水稻') {
        result = {
            name: '水稻纹枯病',
            type: '真菌性病害',
            confidence: 0.968,
            description: '水稻纹枯病又称云纹病，主要危害叶鞘和叶片，严重时可危害稻穗和茎秆。发病初期，叶鞘上出现水渍状暗绿色斑点，以后扩大成椭圆形或云纹状病斑，边缘褐色，中央灰绿色或灰白色。严重时病斑融合，导致叶片枯死，稻穗不能抽出或结实不良。',
            prevention: [
                '选用抗病品种：如汕优63、扬稻6号等抗病品种',
                '农业防治：合理密植，浅水勤灌，适时晒田，清除田间杂草',
                '化学防治：发病初期喷施井冈霉素、纹枯净等杀菌剂，重点喷洒植株中下部',
                '施肥管理：避免偏施氮肥，增施磷钾肥，提高植株抗病能力'
            ]
        };
    } else if (selectedCrop.value) {
        result.name = `${selectedCrop.value}常见病害`;
        result.description = `${selectedCrop.value}的常见病害主要危害叶片和茎秆，发病初期出现斑点状病变，后期会影响作物生长和产量。`;
    }

    diseaseResult.value = result;
    isDetecting.value = false;
};

// 重置所有状态
const resetAll = () => {
    uploadedImage.value = '';
    diseaseResult.value = null;
    selectedCrop.value = ''; // 清空选中的作物
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};
</script>

<style lang="scss" scoped>
// 主题变量
$primary: #388e3c;
$primary-light: #e8f5e9;
$primary-hover: #2e7d32;
$secondary: #66bb6a;
$text-primary: #2d3748;
$text-secondary: #718096;
$text-tertiary: #a0aec0;
$bg-main: #f8f9fa;
$bg-card: #ffffff;
$border: #e2e8f0;
$shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
$shadow-lg: 0 6px 16px rgba(0, 0, 0, 0.12);
$radius-sm: 8px;
$radius-md: 12px;
$radius-lg: 16px;
$transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

// 全局样式
.disease-detection-container {
    min-height: 100vh;
    background-color: $bg-main;
    font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: $text-primary;
    position: relative; // 为弹窗定位做准备
}

// 导航栏
.nav-header {
    background-color: $bg-card;
    box-shadow: $shadow-sm;
    position: sticky;
    top: 0;
    z-index: 999;

    .nav-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1.25rem;
        display: flex;
        align-items: center;
        height: 56px;

        .back-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background: transparent;
            border: none;
            color: $primary;
            font-size: 15px;
            font-weight: 500;
            cursor: pointer;
            padding: 8px 12px;
            border-radius: $radius-sm;
            transition: $transition;

            &:hover {
                color: $primary-hover;
                background-color: $primary-light;
            }

            .back-icon {
                width: 18px;
                height: 18px;
            }

            .back-text {
                letter-spacing: 0.2px;
            }
        }
    }
}

// 主内容区
.main-content {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1.25rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        padding: 1.5rem 1rem;
        gap: 1.5rem;
    }
}

// 卡片通用样式
.upload-card,
.result-card {
    background: $bg-card;
    border-radius: $radius-lg;
    box-shadow: $shadow-md;
    padding: 2rem;
    transition: $transition;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, $primary, $secondary);
    }

    &:hover {
        box-shadow: $shadow-lg;
        transform: translateY(-2px);
    }

    .card-title {
        font-size: 1.3rem;
        color: $primary;
        margin-bottom: 1.75rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid $border;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;

        .title-icon {
            font-size: 1.4rem;
        }

        @media (max-width: 768px) {
            font-size: 1.15rem;
            margin-bottom: 1.5rem;
        }
    }
}

// 上传区域
.upload-section {
    .upload-area {
        border: 2px dashed $border;
        border-radius: $radius-md;
        padding: 3.5rem 1.5rem;
        text-align: center;
        cursor: pointer;
        transition: $transition;
        position: relative;
        margin-bottom: 1.75rem;
        background-color: rgba(245, 245, 247, 0.5);

        &--dragging {
            border-color: $primary;
            background-color: $primary-light;
            transform: scale(1.01);

            .upload-placeholder {
                .upload-icon {
                    color: $primary;
                    animation: pulse 1.5s infinite;
                }
            }
        }

        .upload-placeholder {
            .upload-icon-wrapper {
                margin-bottom: 1.25rem;

                .upload-icon {
                    width: 56px;
                    height: 56px;
                    color: $text-secondary;
                    transition: $transition;
                }
            }

            .upload-desc {
                font-size: 1rem;
                color: $text-primary;
                margin: 0 0 0.75rem 0;
                font-weight: 500;
            }

            .upload-tip {
                font-size: 0.85rem;
                color: $text-tertiary;
                margin: 0;
            }
        }

        .image-preview {
            position: relative;
            width: 100%;
            aspect-ratio: 4/3;
            overflow: hidden;
            border-radius: $radius-sm;
            background-color: $bg-main;

            .preview-img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                padding: 1rem;
            }

            .remove-img-btn {
                position: absolute;
                top: 12px;
                right: 12px;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background-color: rgba(0, 0, 0, 0.6);
                color: white;
                border: none;
                cursor: pointer;
                font-size: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: $transition;
                opacity: 0.8;

                &:hover {
                    opacity: 1;
                    background-color: #e53e3e;
                    transform: scale(1.1);
                }
            }
        }

        .file-input {
            display: none;
        }
    }

    // 识别按钮
    .detect-btn {
        width: 100%;
        padding: 0.85rem 1rem;
        border: none;
        border-radius: $radius-md;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: $transition;
        background: linear-gradient(135deg, $primary, $primary-hover);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        letter-spacing: 0.3px;

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        &:not(:disabled):hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(56, 142, 60, 0.3);
        }

        .detect-icon {
            font-size: 1.1rem;
        }

        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;

            .loading-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: white;
                animation: loading 1.4s infinite ease-in-out both;

                &:nth-child(1) {
                    animation-delay: -0.32s;
                }

                &:nth-child(2) {
                    animation-delay: -0.16s;
                }
            }
        }
    }
}

// 结果区域
.result-section {
    .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.75rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid $border;

        .disease-name {
            font-size: 1.4rem;
            color: $primary;
            font-weight: 600;
            margin: 0;
            letter-spacing: 0.2px;
        }

        .confidence-tag {
            background: linear-gradient(135deg, $primary-light, #dcedc8);
            color: $primary;
            padding: 0.4rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 2px 4px rgba(56, 142, 60, 0.1);

            .tag-icon {
                font-size: 0.85rem;
            }
        }

        @media (max-width: 768px) {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;

            .disease-name {
                font-size: 1.25rem;
            }

            .confidence-tag {
                align-self: flex-start;
            }
        }
    }

    .result-details {
        margin-bottom: 2rem;

        .detail-item {
            margin-bottom: 1.5rem;

            .detail-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 0.75rem;

                .detail-icon {
                    font-size: 1rem;
                    color: $primary;
                }

                .detail-label {
                    font-size: 1rem;
                    color: $text-primary;
                    font-weight: 600;
                    margin: 0;
                }
            }

            .detail-value {
                line-height: 1.7;
                color: $text-secondary;
                margin: 0;
                font-size: 0.95rem;
                text-align: justify;
            }

            .prevention-list {
                padding-left: 1.5rem;
                margin: 0;

                li {
                    line-height: 1.8;
                    color: $text-secondary;
                    margin-bottom: 0.75rem;
                    font-size: 0.95rem;
                    list-style: none;
                    position: relative;
                    padding-left: 0.5rem;

                    &:last-child {
                        margin-bottom: 0;
                    }

                    .list-icon {
                        color: $secondary;
                        position: absolute;
                        left: -1.25rem;
                        top: 0.1rem;
                    }
                }
            }
        }
    }

    // 重置按钮
    .reset-btn {
        width: 100%;
        padding: 0.85rem 1rem;
        border: none;
        border-radius: $radius-md;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: $transition;
        background-color: $bg-main;
        color: $text-primary;
        border: 1px solid $border;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        &:hover {
            background-color: $primary-light;
            color: $primary;
            border-color: $primary-light;
            transform: translateY(-2px);
            box-shadow: $shadow-sm;
        }

        .reset-icon {
            font-size: 1.1rem;
        }
    }
}

// 作物选择弹窗样式
.crop-select-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;

    // 遮罩层
    .modal-mask {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(2px);
        transition: $transition;
    }

    // 弹窗内容
    .modal-content {
        position: relative;
        width: 90%;
        max-width: 500px;
        background-color: $bg-card;
        border-radius: $radius-lg;
        box-shadow: $shadow-lg;
        overflow: hidden;
        animation: modalFadeIn 0.3s ease;

        // 弹窗头部
        .modal-header {
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid $border;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .modal-title {
                font-size: 1.15rem;
                font-weight: 600;
                color: $text-primary;
                margin: 0;
            }

            .modal-close {
                background: transparent;
                border: none;
                font-size: 1.25rem;
                color: $text-secondary;
                cursor: pointer;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: $transition;

                &:hover {
                    color: $primary;
                    background-color: $primary-light;
                }
            }
        }

        // 弹窗主体
        .modal-body {
            padding: 1.5rem;
            max-height: 60vh;
            overflow-y: auto;

            .crop-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;

                @media (max-width: 480px) {
                    grid-template-columns: repeat(2, 1fr);
                }

                .crop-item {
                    padding: 1rem;
                    border-radius: $radius-md;
                    border: 1px solid $border;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: $transition;

                    &:hover {
                        border-color: $primary-light;
                        background-color: $primary-light;
                        transform: translateY(-2px);
                    }

                    &.active {
                        border-color: $primary;
                        background-color: $primary-light;
                        color: $primary;
                        font-weight: 500;
                    }

                    .crop-icon {
                        font-size: 1.5rem;
                    }

                    .crop-name {
                        font-size: 0.9rem;
                    }
                }
            }
        }

        // 弹窗底部
        .modal-footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid $border;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 12px;

            .modal-cancel {
                padding: 0.65rem 1.25rem;
                border-radius: $radius-sm;
                border: 1px solid $border;
                background-color: transparent;
                color: $text-secondary;
                font-size: 0.9rem;
                cursor: pointer;
                transition: $transition;

                &:hover {
                    background-color: $bg-main;
                    color: $text-primary;
                }
            }

            .modal-confirm {
                padding: 0.65rem 1.25rem;
                border-radius: $radius-sm;
                border: none;
                background-color: $primary;
                color: white;
                font-size: 0.9rem;
                font-weight: 500;
                cursor: pointer;
                transition: $transition;

                &:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                &:not(:disabled):hover {
                    background-color: $primary-hover;
                    box-shadow: 0 2px 8px rgba(56, 142, 60, 0.2);
                }
            }
        }
    }
}

// 页脚
.page-footer {
    text-align: center;
    padding: 1.5rem;
    color: $text-tertiary;
    font-size: 0.85rem;
    border-top: 1px solid $border;
    margin-top: 1rem;
    background-color: $bg-card;
}

// 动画效果
@keyframes loading {

    0%,
    80%,
    100% {
        transform: scale(0);
    }

    40% {
        transform: scale(1);
    }
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }

    100% {
        transform: scale(1);
    }
}

@keyframes modalFadeIn {
    from {
        opacity: 0;
        transform: translateY(20px) scale(0.98);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

// 响应式细节优化
@media (max-width: 768px) {

    .upload-card,
    .result-card {
        padding: 1.5rem;
    }

    .upload-area {
        padding: 2.5rem 1rem !important;
    }

    .detail-value,
    .prevention-list li {
        font-size: 0.9rem;
    }
}
</style>