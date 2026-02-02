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
                <div class="chart-box">
                    <div class="chart-title">月度降水量与温度变化</div>
                    <div ref="lineBarChart" class="chart-instance"></div>
                </div>
                <div class="chart-box">
                    <div class="chart-title">当日环境温湿度变化</div>
                    <div ref="tempDayChart" class="chart-instance"></div>
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
                        <div class="chart-title">模型识别准确率趋势</div>
                        <div ref="accuracyTrendChart" class="chart-instance small-chart"></div>
                    </div>
                </div>
            </section>

            <section class="panel-column side">
                <div class="chart-box">
                    <div class="chart-title">个人诊断作物类型分布</div>
                    <div ref="cropTypeChart" class="chart-instance"></div>
                </div>
                <div class="chart-box">
                    <div class="chart-title">个人诊断解决率趋势</div>
                    <div ref="solveRateChart" class="chart-instance"></div>
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

const lineBarChart = ref(null);
const tempDayChart = ref(null);
const top5DiseaseChart = ref(null);
const sevenDTrendChart = ref(null);
const accuracyTrendChart = ref(null);
const cropTypeChart = ref(null);
const solveRateChart = ref(null);
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

// 左侧1：月度降水量 + 温度（绿色系改造）
const initLineBarChart = () => {
    const myChart = echarts.init(lineBarChart.value);
    chartInstances.lineBar = myChart;
    myChart.setOption({
        grid: { top: '20%', bottom: '15%', left: '12%', right: '5%' },
        xAxis: {
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            axisLabel: { color: '#8faa9f', fontSize: 10 },
            axisLine: { lineStyle: { color: '#1a3a28' } }
        },
        yAxis: [
            { type: 'value', name: '降水量(mm)', axisLabel: { color: '#8faa9f', fontSize: 10 }, splitLine: { lineStyle: { color: '#1a3a28' } } },
            { type: 'value', name: '温度(℃)', axisLabel: { color: '#009959', fontSize: 10 }, splitLine: { show: false } }
        ],
        series: [
            {
                name: '降水量',
                type: 'bar',
                barWidth: 15,
                yAxisIndex: 0,
                itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#86f7c8' }, { offset: 1, color: '#00e08f' }]) },
                data: [10, 15, 25, 40, 65, 78, 70, 55, 38, 22, 16, 8]
            },
            {
                name: '平均温度',
                type: 'line',
                smooth: true,
                yAxisIndex: 1,
                lineStyle: { color: '#009959', width: 2 },
                data: [3, 6, 13, 19, 25, 29, 31, 30, 26, 19, 11, 5]
            }
        ],
        tooltip: { trigger: 'axis', textStyle: { fontSize: 10 }, backgroundColor: 'rgba(0,40,20,0.8)', borderColor: '#00e08f' }
    });
};

// 左侧2：当日温湿度变化（绿色系改造）
const initTempDayChart = () => {
    const myChart = echarts.init(tempDayChart.value);
    chartInstances.tempDay = myChart;
    myChart.setOption({
        grid: { top: '15%', bottom: '15%', left: '12%', right: '5%' },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['6:00', '8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
            axisLabel: { color: '#8faa9f', fontSize: 10 },
            axisLine: { lineStyle: { color: '#1a3a28' } }
        },
        yAxis: {
            type: 'value',
            min: 10,
            axisLabel: { color: '#8faa9f', fontSize: 10 },
            splitLine: { lineStyle: { color: '#1a3a28' } }
        },
        series: [{
            type: 'line',
            smooth: true,
            data: [13, 16, 20, 25, 28, 26, 21, 17],
            lineStyle: { color: '#00e08f', width: 2 },
            areaStyle: { color: 'rgba(0,224,143,0.2)' },
            itemStyle: { color: '#00e08f' },
            label: { show: true, color: '#fff', fontSize: 9 }
        }],
        tooltip: { trigger: 'axis', textStyle: { fontSize: 10 }, backgroundColor: 'rgba(0,40,20,0.8)', borderColor: '#00e08f' }
    });
};

// 中间1：个人病害识别TOP5（绿色系改造）
const initTop5DiseaseChart = () => {
    const myChart = echarts.init(top5DiseaseChart.value);
    chartInstances.top5Disease = myChart;
    const data = [
        { name: '番茄晚疫病', value: 96 },
        { name: '黄瓜霜霉病', value: 82 },
        { name: '辣椒炭疽病', value: 74 },
        { name: '草莓白粉病', value: 65 },
        { name: '白菜软腐病', value: 51 }
    ];
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

// 中间2：近7天诊断次数趋势（绿色系改造）
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

// 中间4：模型识别准确率趋势（绿色系改造）
const initAccuracyTrendChart = () => {
    const myChart = echarts.init(accuracyTrendChart.value);
    chartInstances.accuracyTrend = myChart;
    myChart.setOption({
        grid: { top: '50%', bottom: '10%', left: '10%', right: '10%' },
        series: [
            {
                type: 'gauge',
                center: ['50%', '30%'],
                radius: '60%',
                startAngle: 180,
                endAngle: 0,
                min: 80,
                max: 100,
                axisLine: {
                    lineStyle: {
                        width: 8,
                        color: [[0.935, new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#86f7c8' }, { offset: 1, color: '#00e08f' }])], [1, '#1a3a28']]
                    }
                },
                splitLine: { show: false },
                axisTick: { show: false },
                axisLabel: { show: false },
                pointer: { show: false },
                detail: {
                    show: true,
                    position: 'center',
                    formatter: '{value}%',
                    color: '#00e08f',
                    fontSize: 16,
                    fontWeight: 'bold'
                },
                data: [{ value: 93.5, name: '当前准确率' }]
            },
            {
                type: 'line',
                smooth: true,
                data: [85.2, 88.5, 90.8, 92.4, 93.5],
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
            data: ['V1', 'V2', 'V3', 'V4', 'V5'],
            axisLabel: { color: '#8faa9f', fontSize: 8 },
            axisLine: { show: false },
            axisTick: { show: false }
        }],
        yAxis: [{ show: false, min: 85, max: 95 }],
        tooltip: { trigger: 'item', textStyle: { fontSize: 9 }, backgroundColor: 'rgba(0,40,20,0.8)', borderColor: '#00e08f' }
    });
};

// 右侧1：个人诊断作物类型分布（绿色系改造）
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

// 右侧2：个人诊断解决率趋势（绿色系改造）
const initSolveRateChart = () => {
    const myChart = echarts.init(solveRateChart.value);
    chartInstances.solveRate = myChart;
    const dateList = ['1日', '2日', '3日', '4日', '5日', '6日', '7日', '8日', '9日', '10日', '11日', '12日', '13日', '14日', '15日'];
    const solveRateList = [72, 75, 78, 80, 82, 85, 83, 86, 88, 90, 89, 91, 92, 93, 94];
    const diagnoseCountList = [12, 15, 18, 20, 22, 25, 23, 26, 28, 30, 29, 32, 35, 33, 36];
    myChart.setOption({
        grid: { top: '15%', bottom: '15%', left: '10%', right: '10%' },
        xAxis: {
            type: 'category',
            data: dateList,
            axisLabel: { color: '#8faa9f', fontSize: 8, interval: 2 },
            axisLine: { lineStyle: { color: '#1a3a28' } }
        },
        yAxis: [
            { type: 'value', name: '解决率(%)', min: 70, max: 100, axisLabel: { color: '#00e08f', fontSize: 8 }, splitLine: { lineStyle: { color: '#1a3a28' } } },
            { type: 'value', name: '诊断次数', axisLabel: { color: '#86f7c8', fontSize: 8 }, splitLine: { show: false } }
        ],
        series: [
            {
                name: '解决率',
                type: 'line',
                smooth: true,
                yAxisIndex: 0,
                data: solveRateList,
                lineStyle: { color: '#00e08f', width: 2 },
                itemStyle: { color: '#00e08f' },
                label: { show: true, color: '#fff', fontSize: 8 },
                areaStyle: { color: 'rgba(0,224,143,0.2)' }
            },
            {
                name: '诊断次数',
                type: 'bar',
                yAxisIndex: 1,
                barWidth: 8,
                data: diagnoseCountList,
                itemStyle: { color: '#86f7c8', borderRadius: 4 }
            }
        ],
        tooltip: {
            trigger: 'axis',
            formatter: '{b}<br/>解决率：{c0}%<br/>诊断次数：{c1}次',
            textStyle: { fontSize: 9 },
            backgroundColor: 'rgba(0,40,20,0.8)',
            borderColor: '#00e08f'
        }
    });
};

// 中间3：个人诊断时段分布（绿色系改造）
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

onMounted(() => {
    updateTime();
    setInterval(updateTime, 1000);
    initLineBarChart();
    initTempDayChart();
    initTop5DiseaseChart();
    init7dTrendChart();
    initDiagnoseTimeChart();
    initAccuracyTrendChart();
    initCropTypeChart();
    initSolveRateChart();
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
    // 农业绿系主背景
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
        // 农业绿渐变头部
        background: linear-gradient(to bottom, rgba(0, 224, 143, 0.3), transparent);
        border-bottom: 2px solid #00e08f;
        margin-bottom: 15px;
        padding: 0 20px;
        border-radius: 6px;
        gap: 15px;

        // 返回按钮农业绿样式
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

        // 时间/状态农业绿文字
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

// ECharts全局绿色系样式
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

// 移动端响应式（农业绿系适配）
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
}
</style>