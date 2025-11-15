<template>
    <div class="home-page">
        <van-search v-model="value" placeholder="请输入搜索关键词" />
        <van-row>
            <van-col span="8" class="van-col-item" @click="toAgrInfo">
                <img src="@/assets/icon/agr/农资.svg" alt="" width="64" height="64">
                <p>农业资讯</p>
                <span>实时查看农业资讯</span>
            </van-col>
            <van-col span="8" class="van-col-item" @click="scan">
                <img src="@/assets/icon/agr/扫一扫.svg" alt="" width="64" height="64">
                <p>病害识别</p>
                <span>精准识别病害</span>
            </van-col>
            <van-col span="8" class="van-col-item" @click="chat">
                <img src="@/assets/icon/agr/杀虫灯虫情.svg" alt="" width="64" height="64">
                <p>防治策略</p>
                <span>AI包治百病</span>
            </van-col>
        </van-row>
        <van-col>
            <van-grid>
                <van-grid-item class="van-col-item">
                    <img src="@/assets/icon/agr/病害草害.svg" alt="" width="48" height="48">
                    <p>病害草害</p>
                </van-grid-item>
                <van-grid-item class="van-col-item">
                    <img src="@/assets/icon/agr/土壤墒情.svg" alt="" width="48" height="48">
                    <p>土壤墒情</p>
                </van-grid-item>
                <van-grid-item class="van-col-item">
                    <img src="@/assets/icon/agr/生长模型.svg" alt="" width="48" height="48">
                    <p>生长模型</p>
                </van-grid-item>
                <van-grid-item class="van-col-item">
                    <img src="@/assets/icon/agr/养殖管理.svg" alt="" width="48" height="48">
                    <p>养殖管理</p>
                </van-grid-item>
            </van-grid>
        </van-col>


        <van-tabs v-model:active="active">
            <van-tab title="推荐">
                <WenZhangComponent></WenZhangComponent>
            </van-tab>
            <van-tab title="病害">病害</van-tab>
            <van-tab title="种植">种植</van-tab>
            <van-tab title="作物">作物</van-tab>
        </van-tabs>

        <!-- 引入AI助手组件 -->
        <!-- <AiAssistant /> -->
    </div>
</template>
<script setup>
import WenZhangComponent from '@/components/WenZhangComponent.vue'
import AiAssistant from '@/components/AiAssistant.vue'  // 引入AI助手组件
import { ref } from 'vue'
import router from '@/router'

const active = ref(0)
const value = ref('')

const scan = () => {
    //跳到扫描页面
    router.push({ name: 'ScanView' })
}
const chat = () => {
    //跳到聊天页面
    router.push({ name: 'ChatView' })
}

const toAgrInfo = () => {
    //滑到农业资讯页面
    document.querySelector('.van-tabs').scrollIntoView({ behavior: 'smooth' })
    active.value = 0
}


</script>

<style lang="scss" scoped>
.van-col-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    p {
        margin: 0;
    }

    span {
        font-size: 12px;
        color: #999;
    }
}
</style>