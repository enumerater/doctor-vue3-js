<template>
    <div class="dashboard-container">
        <header class="header">
            <div class="back-home" @click="goBackHome">
                <span class="back-icon">&larr;</span>
                <span class="back-text">返回首页</span>
            </div>
            <div class="header-left">{{ currentTime }}</div>
            <h1 class="title">个人数据看板</h1>
            <div class="header-right">系统状态：运行中</div>
        </header>

        <main class="main-content">
            <section class="panel-column side">
                <!-- 左侧1：当日温度变化（独立图表） -->
                <div class="chart-box">
                    <div class="chart-title">当日温度变化</div>
                    <div ref="dayTempChart" class="chart-instance"></div>
                </div>
                <!-- 左侧2：当日湿度变化（独立图表） -->
                <div class="chart-box">
                    <div class="chart-title">当日湿度变化</div>
                    <div ref="dayHumidityChart" class="chart-instance"></div>
                </div>
            </section>

            <section class="panel-column center">
                <div class="kpi-container">
                    <div class="kpi-item">
                        <span class="label">本月个人诊断(次)</span>
                        <span class="number yellow">96</span>
                    </div>
                    <div class="kpi-item">
                        <span class="label">累计个人诊断(次)</span>
                        <span class="number">428</span>
                    </div>
                </div>
                <div class="chart-grid-container">
                    <div class="chart-grid-item">
                        <div class="chart-title">个人病害识别TOP5</div>
                        <div ref="top5DiseaseChart" class="chart-instance small-chart"></div>
                    </div>
                    <div class="chart-grid-item">
                        <div class="chart-title">近7天诊断次数趋势</div>
                        <div ref="sevenDTrendChart" class="chart-instance small-chart"></div>
                    </div>
                    <div class="chart-grid-item">
                        <div class="chart-title">个人诊断时段分布</div>
                        <div ref="diagnoseTimeChart" class="chart-instance small-chart"></div>
                    </div>
                    <div class="chart-grid-item">
                        <!-- 大模型接口调用响应耗时趋势（保留，核心监控指标） -->
                        <div class="chart-title">大模型接口调用响应耗时趋势</div>
                        <div ref="apiResponseTimeChart" class="chart-instance small-chart"></div>
                    </div>
                </div>
            </section>

            <section class="panel-column side">
                <div class="chart-box">
                    <div class="chart-title">个人诊断作物类型分布</div>
                    <div ref="cropTypeChart" class="chart-instance"></div>
                </div>
                <!-- 右侧2：替换为 大模型接口调用次数趋势（更合理的接口监控指标） -->
                <div class="chart-box">
                    <div class="chart-title">大模型接口调用次数趋势</div>
                    <div ref="apiCallCountChart" class="chart-instance"></div>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';

const router = useRouter();

// 左侧：温度、湿度独立ref
const dayTempChart = ref(null);
const dayHumidityChart = ref(null);
// 中间：大模型响应耗时
const apiResponseTimeChart = ref(null);
// 右侧：大模型调用次数
const apiCallCountChart = ref(null);
// 原有保留ref
const top5DiseaseChart = ref(null);
const sevenDTrendChart = ref(null);
const cropTypeChart = ref(null);
const diagnoseTimeChart = ref(null);

const currentTime = ref('');
let resizeTimer = null;
let chartInstances = {};

const updateTime = () => {
    const now = new Date();
    currentTime.value = now.toLocaleString();
};

const handleResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        Object.values(chartInstances).forEach(instance => {
            if (instance) {
                instance.resize({ animation: false });
                const isMobile = window.innerWidth <= 768;
                const option = instance.getOption();
                if (option.xAxis) option.xAxis.forEach(axis => axis.axisLabel = { ...axis.axisLabel, fontSize: isMobile ? 8 : 10 });
                if (option.yAxis) option.yAxis.forEach(axis => axis.axisLabel = { ...axis.axisLabel, fontSize: isMobile ? 8 : 10 });
                instance.setOption(option);
            }
        });
    }, 100);
};

const goBackHome = () => {
    router.push({ name: 'chatBegin' });
};

// ==============================================
// 左侧1：当日温度变化（独立图表，纯温度折线）
// ==============================================
const initDayTempChart = (area) => {
    const myChart = echarts.init(dayTempChart.value);
    chartInstances.dayTemp = myChart;
    const timeData = ['6:00', '8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    const tempData = [3, 3, 4, 8, 12, 15, 12, 8, 2]; // 温度数据(℃)

    myChart.setOption({
        grid: { top: '15%', bottom: '15%', left: '12%', right: '5%' },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: timeData,
            axisLabel: { color: '#8faa9f', fontSize: 10 },
            axisLine: { lineStyle: { color: '#1a3a28' } }
        },
        yAxis: {
            type: 'value',
            name: '温度(℃)',
            min: -5,
            max: 20,
            axisLabel: { color: '#00e08f', fontSize: 10 },
            splitLine: { lineStyle: { color: '#1a3a28' } }
        },
        series: [{
            name: '温度',
            type: 'line',
            smooth: true,
            data: tempData,
            lineStyle: { color: '#00e08f', width: 2 },
            areaStyle: { color: 'rgba(0,224,143,0.2)' },
            itemStyle: { color: '#00e08f' },
            label: { show: true, color: '#fff', fontSize: 9 }
        }],
        tooltip: {
            trigger: 'axis',
            textStyle: { fontSize: 10 },
            backgroundColor: 'rgba(0,40,20,0.8)',
            borderColor: '#00e08f',
            formatter: '{b}<br/>温度：{c}℃'
        }
    });
};

// ==============================================
// 左侧2：当日湿度变化（独立图表，纯湿度折线）
// ==============================================
const initDayHumidityChart = () => {
    const myChart = echarts.init(dayHumidityChart.value);
    chartInstances.dayHumidity = myChart;
    const timeData = ['6:00', '8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    const humidityData = [68, 62, 55, 48, 45, 50, 58, 65, 70]; // 湿度数据(%RH)

    myChart.setOption({
        grid: { top: '15%', bottom: '15%', left: '12%', right: '5%' },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: timeData,
            axisLabel: { color: '#8faa9f', fontSize: 10 },
            axisLine: { lineStyle: { color: '#1a3a28' } }
        },
        yAxis: {
            type: 'value',
            name: '湿度(%RH)',
            min: 30,
            max: 80,
            axisLabel: { color: '#86f7c8', fontSize: 10 },
            splitLine: { lineStyle: { color: '#1a3a28' } }
        },
        series: [{
            name: '湿度',
            type: 'line',
            smooth: true,
            data: humidityData,
            lineStyle: { color: '#86f7c8', width: 2 },
            areaStyle: { color: 'rgba(134,247,200,0.2)' },
            itemStyle: { color: '#86f7c8' },
            label: { show: true, color: '#fff', fontSize: 9 }
        }],
        tooltip: {
            trigger: 'axis',
            textStyle: { fontSize: 10 },
            backgroundColor: 'rgba(0,40,20,0.8)',
            borderColor: '#86f7c8',
            formatter: '{b}<br/>湿度：{c}%RH'
        }
    });
};

// ==============================================
// 中间：大模型接口调用响应耗时趋势（保留）
// ==============================================
const initApiResponseTimeChart = () => {
    const myChart = echarts.init(apiResponseTimeChart.value);
    chartInstances.apiResponseTime = myChart;
    const timeTrendData = [2650, 2820, 2780, 2910, 2860];
    const currentAvgTime = Math.round(timeTrendData.reduce((a, b) => a + b, 0) / timeTrendData.length);

    myChart.setOption({
        grid: { top: '50%', bottom: '10%', left: '10%', right: '10%' },
        series: [
            {
                type: 'gauge',
                center: ['50%', '30%'],
                radius: '60%',
                startAngle: 180,
                endAngle: 0,
                min: 1000,
                max: 5000,
                axisLine: {
                    lineStyle: {
                        width: 8,
                        color: [
                            [0.6, new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#86f7c8' }, { offset: 1, color: '#00e08f' }])],
                            [1, '#1a3a28']
                        ]
                    }
                },
                splitLine: { show: false },
                axisTick: { show: false },
                axisLabel: { show: false },
                pointer: { show: false },
                detail: {
                    show: true,
                    position: 'center',
                    formatter: '{value}ms',
                    color: '#00e08f',
                    fontSize: 16,
                    fontWeight: 'bold'
                },
                data: [{ value: currentAvgTime, name: '平均耗时' }]
            },
            {
                type: 'line',
                smooth: true,
                data: timeTrendData,
                xAxisIndex: 0,
                yAxisIndex: 0,
                lineStyle: { color: '#00e08f', width: 2 },
                itemStyle: { color: '#00e08f' },
                label: { show: true, color: '#fff', fontSize: 8 },
                areaStyle: { color: 'rgba(0,224,143,0.2)' }
            }
        ],
        xAxis: [{
            type: 'category',
            data: ['第1次', '第2次', '第3次', '第4次', '第5次'],
            axisLabel: { color: '#8faa9f', fontSize: 8 },
            axisLine: { show: false },
            axisTick: { show: false }
        }],
        yAxis: [{ show: false, min: 2000, max: 3000 }],
        tooltip: {
            trigger: 'item',
            textStyle: { fontSize: 9 },
            backgroundColor: 'rgba(0,40,20,0.8)',
            borderColor: '#00e08f',
            formatter: '第{cIndex+1}次调用<br/>响应耗时：{c}ms'
        }
    });
};

// ==============================================
// 右侧2：大模型接口调用次数趋势（替换原成功率，更合理）
// ==============================================
const initApiCallCountChart = () => {
    const myChart = echarts.init(apiCallCountChart.value);
    chartInstances.apiCallCount = myChart;
    const dateList = ['1日', '2日', '3日', '4日', '5日', '6日', '7日', '8日', '9日', '10日', '11日', '12日', '13日', '14日', '15日'];
    // 每日接口调用次数（贴合诊断次数，真实业务监控）
    const callCountData = [12, 15, 18, 20, 22, 25, 23, 26, 28, 30, 29, 32, 35, 33, 36];

    myChart.setOption({
        grid: { top: '15%', bottom: '15%', left: '10%', right: '10%' },
        xAxis: {
            type: 'category',
            data: dateList,
            axisLabel: { color: '#8faa9f', fontSize: 8, interval: 2 },
            axisLine: { lineStyle: { color: '#1a3a28' } }
        },
        yAxis: {
            type: 'value',
            name: '调用次数',
            axisLabel: { color: '#00e08f', fontSize: 8 },
            splitLine: { lineStyle: { color: '#1a3a28' } }
        },
        series: [
            {
                name: '接口调用次数',
                type: 'line',
                smooth: true,
                data: callCountData,
                lineStyle: { color: '#00e08f', width: 2 },
                itemStyle: { color: '#00e08f' },
                label: { show: true, color: '#fff', fontSize: 8 },
                areaStyle: { color: 'rgba(0,224,143,0.2)' }
            },
            {
                name: '调用次数',
                type: 'bar',
                barWidth: 8,
                data: callCountData,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#86f7c8' },
                        { offset: 1, color: '#00e08f' }
                    ]),
                    borderRadius: 4
                }
            }
        ],
        tooltip: {
            trigger: 'axis',
            formatter: '{b}<br/>大模型接口调用：{c0}次',
            textStyle: { fontSize: 9 },
            backgroundColor: 'rgba(0,40,20,0.8)',
            borderColor: '#00e08f'
        }
    });
};

import { getdiseasedata } from '@/axios/data'
const diseaData = ref([])



// ==================== 原有保留图表 ====================
// 中间1：个人病害识别TOP5
const initTop5DiseaseChart = () => {
    const myChart = echarts.init(top5DiseaseChart.value);
    chartInstances.top5Disease = myChart;
    // 核心：数据结构适配（后端字段diseaseName/value → ECharts需要的name/value）
    const data = diseaData.value.map(item => ({
        name: item.name, // 字段映射：病害名称
        value: item.value       // 字段映射：数值
    }));
    myChart.setOption({
        grid: { top: '20%', bottom: '10%', left: '35%', right: '5%' },
        xAxis: { show: false },
        yAxis: {
            type: 'category',
            data: data.map(i => i.name),
            axisLabel: { color: '#8faa9f', fontSize: 8 },
            axisLine: { show: false },
            axisTick: { show: false }
        },
        series: [{
            type: 'bar',
            barWidth: 6,
            data: data,
            itemStyle: { color: (p) => ['#00e08f', '#86f7c8', '#009959', '#73d9a3', '#28c77d'][p.dataIndex] },
            label: { show: true, position: 'right', formatter: '{c}次', color: '#fff', fontSize: 8 }
        }],
        tooltip: { trigger: 'item', textStyle: { fontSize: 9 }, backgroundColor: 'rgba(0,40,20,0.8)', borderColor: '#00e08f' }
    });
};

// 中间2：近7天诊断次数趋势
const init7dTrendChart = () => {
    const myChart = echarts.init(sevenDTrendChart.value);
    chartInstances.sevenDTrend = myChart;
    myChart.setOption({
        grid: { top: '20%', bottom: '20%', left: '10%', right: '5%' },
        xAxis: {
            type: 'category',
            data: ['1日', '2日', '3日', '4日', '5日', '6日', '7日'],
            axisLabel: { color: '#8faa9f', fontSize: 8 },
            axisLine: { lineStyle: { color: '#1a3a28' } }
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: '#8faa9f', fontSize: 8 },
            splitLine: { lineStyle: { color: '#1a3a28' } },
            axisLine: { show: false }
        },
        series: [{
            type: 'line',
            smooth: true,
            data: [12, 18, 25, 22, 30, 28, 35],
            lineStyle: { color: '#00e08f', width: 2 },
            areaStyle: { color: 'rgba(0,224,143,0.2)' },
            itemStyle: { color: '#00e08f' },
            label: { show: true, color: '#fff', fontSize: 8 },
            markPoint: { data: [{ type: 'max', name: '峰值', itemStyle: { color: '#ffcc00' } }] }
        }],
        tooltip: { trigger: 'axis', textStyle: { fontSize: 9 }, backgroundColor: 'rgba(0,40,20,0.8)', borderColor: '#00e08f' }
    });
};

// 中间3：个人诊断时段分布
const initDiagnoseTimeChart = () => {
    const myChart = echarts.init(diagnoseTimeChart.value);
    chartInstances.diagnoseTime = myChart;
    const data = [
        { name: '凌晨(0-6点)', value: 18 },
        { name: '上午(6-12点)', value: 42 },
        { name: '中午(12-14点)', value: 25 },
        { name: '下午(14-18点)', value: 38 },
        { name: '晚上(18-24点)', value: 51 }
    ];
    myChart.setOption({
        grid: { top: '15%', bottom: '15%', left: '10%', right: '10%' },
        xAxis: {
            type: 'category',
            data: data.map(i => i.name),
            axisLabel: { color: '#8faa9f', fontSize: 8, rotate: 15 },
            axisLine: { lineStyle: { color: '#1a3a28' } },
            axisTick: { show: false }
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: '#8faa9f', fontSize: 8 },
            splitLine: { lineStyle: { color: '#1a3a28' } },
            axisLine: { show: false }
        },
        series: [{
            type: 'bar',
            barWidth: 12,
            data: data,
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#86f7c8' }, { offset: 1, color: '#00e08f' }]),
                borderRadius: 6
            },
            label: { show: true, position: 'top', formatter: '{c}次', color: '#fff', fontSize: 8 }
        }],
        tooltip: { trigger: 'item', formatter: '{b}<br/>诊断次数：{c}次', textStyle: { fontSize: 9 }, backgroundColor: 'rgba(0,40,20,0.8)', borderColor: '#00e08f' }
    });
};

// 右侧1：个人诊断作物类型分布
const initCropTypeChart = () => {
    const myChart = echarts.init(cropTypeChart.value);
    chartInstances.cropType = myChart;
    const data = [
        { name: '番茄', value: 112 },
        { name: '黄瓜', value: 98 },
        { name: '辣椒', value: 85 },
        { name: '草莓', value: 72 },
        { name: '白菜', value: 61 }
    ];
    myChart.setOption({
        grid: { top: '15%', bottom: '15%', left: '10%', right: '10%' },
        xAxis: {
            type: 'category',
            data: data.map(i => i.name),
            axisLabel: { color: '#8faa9f', fontSize: 10 },
            axisLine: { lineStyle: { color: '#1a3a28' } },
            axisTick: { show: false }
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: '#8faa9f', fontSize: 10 },
            splitLine: { lineStyle: { color: '#1a3a28' } },
            axisLine: { show: false }
        },
        series: [{
            type: 'bar',
            barWidth: 20,
            data: data,
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#86f7c8' }, { offset: 1, color: '#00e08f' }]),
                borderRadius: 6
            },
            label: { show: true, position: 'top', formatter: '{c}次', color: '#fff', fontSize: 9 }
        }],
        tooltip: { trigger: 'item', formatter: '{b}<br/>诊断次数：{c}次', textStyle: { fontSize: 10 }, backgroundColor: 'rgba(0,40,20,0.8)', borderColor: '#00e08f' }
    });
};



onMounted(() => {
    updateTime();
    setInterval(updateTime, 1000);
    // 左侧独立图表
    initDayTempChart();
    initDayHumidityChart();
    // 中间&右侧
    initApiResponseTimeChart();
    initApiCallCountChart();
    // 原有保留
    getdiseasedata().then(res => {
        console.log(res)
        diseaData.value = res.data // 数据赋值完成
        initTop5DiseaseChart() // 关键：数据就绪后，再初始化渲染图表
    })
    init7dTrendChart();
    initDiagnoseTimeChart();
    initCropTypeChart();

    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    Object.values(chartInstances).forEach(instance => instance && echarts.dispose(instance));
    clearInterval(updateTime);
    clearTimeout(resizeTimer);
});
</script>

<style lang="scss" scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html,
body {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    -webkit-tap-highlight-color: transparent;
}

.dashboard-container {
    background: #002a15;
    background-image: radial-gradient(circle at center, #003a20 0%, #002a15 100%);
    color: #fff;
    min-height: 100vh;
    padding: 15px;
    display: flex;
    flex-direction: column;

    .header {
        height: 60px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        background: linear-gradient(to bottom, rgba(0, 224, 143, 0.3), transparent);
        border-bottom: 2px solid #00e08f;
        margin-bottom: 15px;
        padding: 0 20px;
        border-radius: 6px;
        gap: 15px;

        .back-home {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: linear-gradient(to right, #009959, #00e08f);
            border: 1px solid #86f7c8;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
            white-space: nowrap;

            &:hover {
                background: linear-gradient(to right, #00e08f, #009959);
                transform: scale(1.05);
            }

            &:active {
                transform: scale(0.95);
            }

            .back-icon {
                font-size: 16px;
                color: #fff;
                font-weight: bold;
            }

            .back-text {
                font-size: 14px;
                color: #fff;
                font-weight: 500;
            }
        }

        .title {
            font-size: 22px;
            font-weight: bold;
            letter-spacing: 2px;
            text-shadow: 0 0 10px #00e08f;
            margin: 0;
            text-align: center;
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .header-left,
        .header-right {
            font-family: monospace;
            color: #00e08f;
            width: 120px;
            font-size: 14px;
        }

        .header-left {
            text-align: left;
        }

        .header-right {
            text-align: right;
        }
    }

    .main-content {
        flex: 1;
        display: grid;
        grid-template-columns: 300px 1fr 300px;
        gap: 15px;
        width: 100%;
    }

    .panel-column {
        display: flex;
        flex-direction: column;
        gap: 15px;
        width: 100%;
    }

    .chart-box {
        flex: 1;
        background: rgba(0, 40, 20, 0.4);
        border: 1px solid #1a3a28;
        position: relative;
        padding: 10px;
        display: flex;
        flex-direction: column;
        min-height: 280px;
        border-radius: 6px;

        &::before {
            content: "";
            position: absolute;
            top: -1px;
            left: -1px;
            width: 10px;
            height: 10px;
            border-top: 2px solid #00e08f;
            border-left: 2px solid #00e08f;
            border-radius: 2px 0 0 0;
        }

        .chart-title {
            font-size: 14px;
            color: #00e08f;
            border-left: 3px solid #00e08f;
            padding-left: 8px;
            margin-bottom: 10px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .chart-instance {
            flex: 1;
            width: 100%;
            min-height: 200px;
        }
    }

    .center {
        .kpi-container {
            display: flex;
            gap: 20px;
            justify-content: center;
            padding: 10px 0;
            flex-wrap: nowrap;

            .kpi-item {
                background: rgba(0, 40, 20, 0.3);
                padding: 10px 30px;
                border: 1px solid #00e08f;
                text-align: center;
                border-radius: 4px;
                min-width: 160px;

                .label {
                    display: block;
                    font-size: 12px;
                    color: #8faa9f;
                    margin-bottom: 5px;
                }

                .number {
                    font-size: 32px;
                    font-weight: bold;
                    font-family: 'Impact', sans-serif;
                    color: #00e08f;
                }

                .yellow {
                    color: #ffcc00;
                }
            }
        }

        .chart-grid-container {
            flex: 1;
            background: rgba(0, 40, 20, 0.3);
            border: 1px solid #1a3a28;
            border-radius: 6px;
            padding: 15px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 15px;
            min-height: 450px;

            .chart-grid-item {
                background: rgba(0, 30, 15, 0.4);
                border: 1px solid #1a3a28;
                border-radius: 4px;
                padding: 8px;
                display: flex;
                flex-direction: column;
                position: relative;
                min-height: 200px;

                &::before {
                    content: "";
                    position: absolute;
                    top: -1px;
                    left: -1px;
                    width: 8px;
                    height: 8px;
                    border-top: 2px solid #00e08f;
                    border-left: 2px solid #00e08f;
                    border-radius: 2px 0 0 0;
                }

                .chart-title {
                    font-size: 12px;
                    color: #00e08f;
                    border-left: 2px solid #00e08f;
                    padding-left: 6px;
                    margin-bottom: 8px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .small-chart {
                    flex: 1;
                    min-height: 150px;
                    width: 100%;
                }
            }
        }
    }
}

:deep(.echarts) {
    width: 100% !important;
    height: 100% !important;
}

:deep(.ec-axis-label) {
    font-size: 10px !important;
    color: #8faa9f !important;
}

:deep(.ec-tooltip) {
    font-size: 10px !important;
    padding: 6px 10px !important;
    background: rgba(0, 40, 20, 0.8) !important;
    border-color: #00e08f !important;
}

:deep(.ec-gauge-detail) {
    font-size: 16px !important;
    color: #00e08f !important;
}

:deep(.ec-bar-label) {
    font-size: 9px !important;
    color: #fff !important;
}

:deep(.ec-line-label) {
    font-size: 9px !important;
    color: #fff !important;
}

@media screen and (max-width: 768px) {
    .dashboard-container {
        padding: 8px;
        min-height: 100vh;

        .header {
            height: auto;
            flex-wrap: wrap;
            padding: 10px 8px;
            margin-bottom: 10px;
            gap: 8px;
            border-bottom-width: 1px;
            justify-content: flex-start;

            .back-home {
                padding: 4px 8px;
                gap: 4px;
                border-radius: 3px;
                order: 1;
                border-color: #86f7c8;

                .back-icon {
                    font-size: 12px;
                }

                .back-text {
                    font-size: 10px;
                }
            }

            .title {
                font-size: 18px;
                letter-spacing: 1px;
                order: 2;
                width: 100%;
                margin: 0;
                text-shadow: 0 0 8px #00e08f;
            }

            .header-left,
            .header-right {
                width: auto;
                font-size: 12px;
                flex: 1;
                order: 3;
                color: #00e08f;
            }
        }

        .main-content {
            grid-template-columns: 1fr;
            gap: 10px;
        }

        .panel-column {
            gap: 10px;
        }

        .chart-box {
            min-height: 200px;
            padding: 8px;
            border-width: 1px;
            border-color: #1a3a28;

            &::before {
                width: 8px;
                height: 8px;
                border-color: #00e08f;
            }

            .chart-title {
                font-size: 12px;
                padding-left: 6px;
                border-left-width: 2px;
                color: #00e08f;
            }

            .chart-instance {
                min-height: 140px;
            }
        }

        .center {
            .kpi-container {
                flex-wrap: wrap;
                gap: 8px;
                padding: 8px 0;

                .kpi-item {
                    padding: 8px 15px;
                    min-width: 120px;
                    flex: 1;
                    border-width: 1px;
                    border-color: #00e08f;

                    .label {
                        font-size: 10px;
                        color: #8faa9f;
                    }

                    .number {
                        font-size: 24px;
                        color: #00e08f;
                    }
                }
            }

            .chart-grid-container {
                grid-template-columns: 1fr;
                grid-template-rows: repeat(4, 1fr);
                gap: 10px;
                padding: 10px;
                min-height: 800px;
                height: auto;
                border-color: #1a3a28;

                .chart-grid-item {
                    min-height: 180px;
                    padding: 6px;
                    border-width: 1px;
                    border-color: #1a3a28;

                    &::before {
                        width: 6px;
                        height: 6px;
                        border-color: #00e08f;
                    }

                    .chart-title {
                        font-size: 10px;
                        padding-left: 4px;
                        color: #00e08f;
                    }

                    .small-chart {
                        min-height: 120px;
                    }
                }
            }
        }
    }

    :deep(.ec-axis-label) {
        font-size: 8px !important;
        color: #8faa9f !important;
    }

    :deep(.ec-tooltip) {
        font-size: 9px !important;
        padding: 4px 8px !important;
        background: rgba(0, 40, 20, 0.8) !important;
        border-color: #00e08f !important;
    }

    :deep(.ec-gauge-detail) {
        font-size: 12px !important;
        color: #00e08f !important;
    }

    :deep(.ec-bar-label) {
        font-size: 8px !important;
    }

    :deep(.ec-line-label) {
        font-size: 8px !important;
    }


    // font-size: 2rem;
    // margin-bottom: 0.5rem;

}

.layout-name {
    font-size: 0.9rem;
    color: $text-primary;
    font-weight: 500;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid $border;
}

.modal-btn {
    padding: 0.75rem 1.5rem;
    border-radius: $radius-md;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: $transition;
    border: none;

    &.cancel-btn {
        background-color: $bg-main;
        color: $text-secondary;

        &:hover {
            background-color: rgba($primary, 0.1);
            color: $text-primary;
        }
    }

    &.save-btn {
        background: linear-gradient(to right, $primary, $primary-hover);
        color: white;

        &:hover {
            background: linear-gradient(to right, $primary-hover, $primary);
            transform: translateY(-1px);
            box-shadow: $shadow-md;
        }

        &:active {
            transform: translateY(0);
        }
    }
}

// 不同布局样式
.main-content.default {
    grid-template-columns: 300px 1fr 300px;
}

.main-content.compact {
    grid-template-columns: 250px 1fr 250px;
    gap: 10px;
}

.main-content.expanded {
    grid-template-columns: 1fr;
}
</style>