<script setup>
// const tools = [
//     { label: '我的问诊', path: '/user/consult', src: '@/assets/icon/钱包.svg' },
//     { label: '我的处方', path: '/user/recipe', src: '@/assets/icon/日历.svg' },
//     { label: '家庭档案', path: '/user/patient', src: '@/assets/icon/数据.svg' },
//     { label: '地址管理', path: '/user/address', src: '@/assets/icon/公文包.svg' },
//     { label: '我的评价', path: '/user/comment', src: '@/assets/icon/数据.svg' },
//     { label: '官方客服', path: '/user/service', src: '@/assets/icon/数据.svg' },
//     { label: '设置', path: '/user/setting', src: '@/assets/icon/数据.svg' }
// ]
</script>

<template>
    <div class="user-page">
        <div class="user-page-head">
            <div class="top">
                <van-image round fit="cover"
                    src="https://yanxuan-item.nosdn.127.net/ef302fbf967ea8f439209bd747738aba.png"
                    style="width: 80px; height: 80px;" />
                <div class="name">
                    <p>用户907456</p>
                    <p><van-icon name="edit" /></p>
                </div>
            </div>

            <van-row>
                <van-col span="6" class="user-col">
                    <p class="user-num">150</p>
                    <p class="user-word">test</p>
                </van-col>
                <van-col span="6" class="user-col">
                    <p class="user-num">23</p>
                    <p class="user-word">test</p>
                </van-col>
                <van-col span="6" class="user-col">
                    <p class="user-num">270</p>
                    <p class="user-word">test</p>
                </van-col>
                <van-col span="6" class="user-col">
                    <p class="user-num">3</p>
                    <p class="user-word">test</p>
                </van-col>
            </van-row>
        </div>
        <div class="user-page-order">
            <div class="head">
                <h3>主要功能</h3>
                <router-link to="/order" style="color: gray;">返回首页 <van-icon name="arrow" /></router-link>
            </div>

            <van-grid>
                <van-grid-item>
                    <img src="@/assets/icon/待付款.svg" alt="" width="32" height="32">
                    <p>test</p>
                </van-grid-item>
                <van-grid-item>
                    <img src="@/assets/icon/待发货.svg" alt="" width="32" height="32">
                    <p>test</p>
                </van-grid-item>
                <van-grid-item>
                    <img src="@/assets/icon/配送中.svg" alt="" width="32" height="32">
                    <p>test</p>
                </van-grid-item>
                <van-grid-item>
                    <img src="@/assets/icon/已完成.svg" alt="" width="32" height="32">
                    <p>test</p>
                </van-grid-item>
            </van-grid>
        </div>
        <div class="user-page-group">
            <h3>快捷工具</h3>
            <div class="user-page-cell">
                <van-cell title="单元格" icon="shop-o" is-link to="/user/consult">
                </van-cell>
                <van-cell title="单元格" icon="shop-o" is-link to="/user/recipe">
                </van-cell>
                <van-cell title="单元格" icon="shop-o" is-link to="/user/patient">
                </van-cell>
                <van-cell title="单元格" icon="shop-o" is-link to="/user/address">
                </van-cell>
                <van-cell title="单元格" icon="shop-o" is-link to="/user/comment">
                </van-cell>
                <van-cell title="单元格" icon="shop-o" is-link to="/user/service">
                </van-cell>
                <van-cell title="单元格" icon="shop-o" is-link to="/user/setting">
                </van-cell>
                <van-cell title="单元格" icon="shop-o" is-link to="/user/logout">
                </van-cell>

            </div>

        </div>
    </div>
</template>

<style lang="scss" scoped>
.user-page {
    min-height: calc(100vh - 50px);
    padding: 0 15px 65px;

}

.top {
    display: flex;
    align-items: center;
    padding-top: 36px;

}

.head {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.user-page-head {
    height: 200px;
    background: linear-gradient(180deg, rgba(44, 181, 165, 0.46), rgba(44, 181, 165, 0));
    margin: 0 -15px;
    padding: 0 15px;
}

.user-num {
    font-size: 24px;
    font-weight: bold;
    color: black;
}

.user-word {
    font-size: 16px;
    color: gray;
}

.user-col {
    display: flex;
    flex-direction: column;
    align-items: center;

    p {
        margin: 0
    }
}

.user-page-cell {
    display: flex;
    flex-direction: column;

}
</style>
