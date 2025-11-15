<template>
    <!-- 列表容器：使用List组件实现分页加载 -->
    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多数据了" @load="onLoad" :offset="100">
        <!-- 循环渲染列表项：每个项都是一个新闻卡片 -->
        <div v-for="item in list" :key="item.id" class="interview-card" @click="goToDetail(item)">
            <!-- 中间文本内容区 -->
            <div class="text-section">
                <h3 class="section-title">{{ item.title }}</h3> <!-- 新闻标题 -->
                <p class="tip-desc">
                    <!-- 内容截取：只显示前100字，超出省略 -->
                    {{ item.content ? (item.content.length > 100 ? item.content.slice(0, 100) + '...' : item.content) :
                        '无内容' }}
                </p>
            </div>
            <!-- 临时隐藏，有图片时改为v-if="item.imageUrls && item.imageUrls.length" -->
            <!-- 图片列表区：后端无图片字段，默认隐藏（如需显示可扩展News实体添加imageUrls字段） -->
            <van-row gutter="8" class="image-row" v-if="false">
                <van-col span="8" v-for="(img, idx) in item.imageUrls" :key="idx">
                    <van-image :src="img" fit="cover" />
                </van-col>
            </van-row>

            <!-- 互动数据区：使用浏览量和更新时间 -->
            <div class="interact-data">
                <span>{{ item.views }} 浏览</span> <!-- 对应views字段 -->
                <span>{{ formatTime(item.pubTime) }}</span> <!-- 格式化更新时间 -->
            </div>
        </div>
    </van-list>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getNewsList } from '@/axios/news';
import { showToast } from 'vant';
import { useRouter } from 'vue-router'; // 导入路由工具
// 初始化路由实例
const router = useRouter();

// 跳转详情页方法
const goToDetail = (item) => {
    // 通过路由跳转到详情页，并携带文章ID（item.id）
    router.push({
        path: `/news/detail/${item.id}`, // 路径包含动态参数id
        // 或使用name+params方式
        // name: 'NewsDetail',
        // params: { id: item.id }
    });
};


// 列表数据（存储从后端获取的新闻列表）
const list = ref([]);

// 加载状态
const loading = ref(false);
// 结束状态
const finished = ref(false);

// 分页参数（与后端NewsPageDTO对应）
const page = ref(1);
const pageSize = ref(10);

// 格式化时间（例如：2023-10-01 12:00:00 → 2023-10-01）
const formatTime = (timeStr) => {
    if (!timeStr) return '未知时间';
    return timeStr.split(' ')[0];
};

// 从后端获取分页数据
const fetchData = async () => {
    try {
        loading.value = true;

        const res = await getNewsList({
            currentPage: page.value,
            pageSize: pageSize.value,
        });

        const { list: newData } = res.data;
        // 合并新数据
        list.value = [...list.value, ...newData];

        // 判断是否加载完毕（当前页数据小于页大小 → 没有更多）
        if (newData.length < pageSize.value) {
            finished.value = true;
        } else {
            page.value++; // 页码自增，下次加载下一页
        }

    } catch (error) {
        showToast('数据加载失败，请重试');
        console.error('请求错误：', error);
    } finally {
        loading.value = false;
    }
};

// 滚动加载更多
const onLoad = () => {
    if (finished.value) return;
    fetchData();
};

// 初始化加载第一页
onMounted(() => {
    fetchData();
});
</script>

<style scoped>
.interview-card {
    padding: 10px;
    border-bottom: 1px solid #f5f5f5;
    margin-bottom: 10px;
}

.text-section {
    margin-bottom: 15px;
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    line-height: 1.3;
}

.tip-desc {
    font-size: 14px;
    color: #666;
    line-height: 1.5;
}

.image-row {
    margin-bottom: 10px;
    height: 80px;
}

.image-row .van-image {
    width: 100%;
    height: 100%;
    border-radius: 4px;
}

.interact-data {
    font-size: 12px;
    color: #999;
    padding: 5px 0;
}

.interact-data span {
    margin-right: 12px;
}
</style>