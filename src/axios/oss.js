import request from '@/utils/requests'
import CryptoJS from 'crypto-js'
import { compressImage } from '@/utils/image'

// 计算文件的 MD5 值
const calculateFileMD5 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer)
        const md5 = CryptoJS.MD5(wordArray).toString()
        resolve(md5)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = (error) => {
      reject(error)
    }
  })
}

// 整合后的文件上传函数（替换原有同名函数，避免重复定义）
export const upload = async (file) => {
  try {
    // 0. 如果是图片且大于 2MB，进行压缩
    if (file.type.startsWith('image/')) {
      file = await compressImage(file, { maxSizeMB: 2 })
    }

    // 1. 计算文件 MD5 值
    const picCode = await calculateFileMD5(file)
    console.log('文件 MD5 值:', picCode)

    // 2. 调用 /vision/getPic 接口检查图片是否已存在
    const checkResponse = await request({
      url: '/vision/getPic',
      method: 'get',
      params: { picCode },
    })

    // 3. 如果后端返回了 url，直接使用该 url
    if (checkResponse && checkResponse.data) {
      console.log('图片已存在，使用已有 URL:', checkResponse.data)
      return { data: checkResponse.data }
    }

    // 4. 如果图片不存在，执行 OSS 上传
    console.log('图片不存在，执行 OSS 上传')
    const formData = new FormData()
    // 注意：这里的 "file" 要和后端 @RequestParam("file") 的参数名完全一致
    formData.append('file', file)

    // 5. 使用项目的 request 工具发送请求
    const uploadResponse = await request({
      url: '/oss/upload',
      method: 'post',
      data: formData, // 传递 FormData 而非原始文件
      // 6. 关键：配置请求头，让浏览器自动生成 multipart/form-data + boundary
      headers: {
        'Content-Type': undefined, // 清空默认 Content-Type，由浏览器自动处理
        // 如果 request 工具默认有拦截器设置 Content-Type，也可以用下面这行：
        // 'Content-Type': 'multipart/form-data'
      },
      // 7. 可选：添加上传进度监听（提升体验）
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total > 0) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          console.log('文件上传进度:', percent + '%')
        }
      },
    })

    // 9. 调用 /vision/savePic 接口保存图片信息
    const saveResponse = await request({
      url: '/vision/savePic',
      method: 'get',
      params: {
        picCode,
        picUrl: uploadResponse.data.url,
      },
    })
    console.log('图片信息保存成功:', saveResponse)

    return { data: uploadResponse.data }
  } catch (error) {
    // 统一错误处理，方便前端捕获提示
    console.error('OSS 文件上传失败:', error)
    // 抛出错误，让调用方（前端组件）可以捕获并提示用户
    throw new Error(error.message || '文件上传失败，请重试')
  }
}
