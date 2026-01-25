import request from '@/utils/requests'

// 整合后的文件上传函数（替换原有同名函数，避免重复定义）
export const upload = async (file) => {
  // 1. 核心：用 FormData 封装文件（解决 multipart 请求问题）
  const formData = new FormData()
  // 注意：这里的 "file" 要和后端 @RequestParam("file") 的参数名完全一致
  formData.append('file', file)

  try {
    // 2. 使用项目的 request 工具发送请求
    const response = await request({
      url: '/oss/upload',
      method: 'post',
      data: formData, // 传递 FormData 而非原始文件
      // 3. 关键：配置请求头，让浏览器自动生成 multipart/form-data + boundary
      headers: {
        'Content-Type': undefined, // 清空默认 Content-Type，由浏览器自动处理
        // 如果 request 工具默认有拦截器设置 Content-Type，也可以用下面这行：
        // 'Content-Type': 'multipart/form-data'
      },
      // 4. 可选：添加上传进度监听（提升体验）
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total > 0) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          console.log('文件上传进度：', percent + '%')
        }
      },
    })

    return response
  } catch (error) {
    // 统一错误处理，方便前端捕获提示
    console.error('OSS 文件上传失败：', error)
    // 抛出错误，让调用方（前端组件）可以捕获并提示用户
    throw new Error(error.message || '文件上传失败，请重试')
  }
}
