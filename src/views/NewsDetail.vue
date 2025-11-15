<template>
    <div>
        <van-nav-bar title="新闻详情" left-arrow @click-left="$router.back()" />
        <div class="news-detail">
            <van-loading v-if="loading" />
            <div v-else class="detail-content">
                <h1 class="title">{{ newsDetail.title }}</h1>
                <div class="info">
                    <span>{{ newsDetail.views }} 浏览</span>
                    <span>{{ newsDetail.unit }}</span>
                    <span>{{ formatTime(newsDetail.pubTime) }}</span>
                </div>
                <div class="content" v-html="newsDetail.content"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router'; // 用于获取路由参数
import { getNewsDetail } from '@/axios/news'; // 假设存在获取详情的接口
import { showToast } from 'vant';

// 获取路由参数
const route = useRoute();
const newsId = route.params.id; // 从路由参数中获取文章ID

// 详情数据
const newsDetail = ref({});
const loading = ref(true);

// 格式化时间（复用列表页逻辑）
const formatTime = (timeStr) => {
    if (!timeStr) return '未知时间';
    return timeStr.split(' ')[0];
};

// 加载详情数据
const loadDetail = async () => {
    try {
        loading.value = true;
        const res = await getNewsDetail(newsId); // 调用详情接口
        newsDetail.value = res.data;
    } catch (error) {
        showToast('详情加载失败');
        console.error(error);
    } finally {
        loading.value = false;
    }
};

// 页面挂载时加载详情
onMounted(() => {
    loadDetail();
});
</script>

<style scoped>
.news-detail {
    padding: 15px;
}

.title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 15px;
    line-height: 1.4;
}

.info {
    color: #999;
    font-size: 12px;
    margin-bottom: 20px;
    display: flex;
    gap: 15px;
}

.content {
    font-size: 16px;
    line-height: 1.8;
}
</style>