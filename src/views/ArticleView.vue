<template>
    <!-- <van-uploader :after-read="afterRead" v-model="fileList" :max-count="1" /> -->
    <div class="a">
        健康百科
    </div>
</template>

<script setup>
import { upload } from '@/axios/common'
import { ref } from 'vue'
const imageUrl = ref('https://enumerate-oss.oss-cn-qingdao.aliyuncs.com/77f5e9d8-bab3-4026-ae21-726a3d513701.jpg')
const fileList = ref([
    {
        name: 'file',
        url: imageUrl.value,
    }
])
const afterRead = async (file) => {
    console.log("原生File对象位置：", file.file); // 确认这里是File类型
    const formData = new FormData()
    // 关键：使用 file.file 获取原生File对象
    formData.append('file', file.file)
    // 验证FormData中是否正确添加了文件
    console.log("FormData中的文件：", formData.get('file')); // 应输出File对象
    console.log("是否为File类型：", formData.get('file') instanceof File); // 应为true

    const res = await upload(formData)
    if (res.code === 1) {
        console.log(res.data.url)
        imageUrl.value = res.data.url
    }
}

</script>

<style lang="scss" scoped></style>