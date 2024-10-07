import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { pngCompose } from 'src/utils/image-processer'
import { isGif, pngsToGif } from 'src/utils/image-processer/gif'

const gifData = {
  gifWidth: 112,
  gifHeigh: 112,
  fps: 15,
}

// 手部合成的帧数据
export const frames: any[] = [
  { x: 14, y: 20, width: 98, height: 98 },
  { x: 12, y: 33, width: 101, height: 85 },
  { x: 8, y: 40, width: 110, height: 76 },
  { x: 10, y: 33, width: 102, height: 84 },
  { x: 12, y: 20, width: 98, height: 98 },
]

export const loadHandImages = async (): Promise<Buffer[]> => {
  const targetDir = path.resolve(__dirname, 'images')
  const files = await fs.readdir(targetDir)
  try {
    const imageFiles = files.filter((file) =>
      file.toLowerCase().endsWith('.png'),
    )
    const imagePromises = imageFiles.map((file) => {
      const filePath = path.join(targetDir, file)
      try {
        return sharp(filePath).ensureAlpha().toBuffer()
      } catch (err) {
        throw err
      }
    })

    return Promise.all(imagePromises)
  } catch (err) {
    console.error(`读取目录 ${targetDir} 时发生错误: ${err}`)
    throw err
  }
}

/**
 * 异步函数：生成动图GIF
 * @param inputImg 图像缓冲区，单张图片或者是GIF
 * @returns 返回一个Promise，解析为包含GIF图像的缓冲区，如果发生错误则可能返回void
 *
 * 此函数负责生成一个动图GIF它首先加载手部图像，然后为每一帧创建相应的缓冲区图像，
 * 最后将所有帧合并生成GIF图像如果在生成过程中发生错误，会抛出异常并打印错误信息
 */
const craftPetpetGif = async function genPetpetGif(
  inputImg: Buffer,
): Promise<Buffer | void> {
  const isGifFlag = await isGif(inputImg)
  if (!isGifFlag) {
    return await processStaticImage(inputImg)
  } else if (isGifFlag) {
    // return await processGifImage(inputImg)
  }
}

// 处理静态图像
const processStaticImage = async function processStaticImage(
  inputImg: Buffer,
): Promise<Buffer> {
  const result: Buffer[] = [] // 结果缓冲区
  // 读取手部图
  const hands = await loadHandImages()
  for (let i = 0; i < hands.length; i++) {
    const src = hands[i]
    const frame = frames[i]
    const join: any[] = [
      { img: src, frameData: {} },
      { img: inputImg, frameData: { ...frame, blendOption: 'dest-over' } },
    ]
    const resPng = await pngCompose(join)
    result.push(resPng)
  }
  const gif = await pngsToGif(result, gifData)
  return gif
}

// 处理 GIF 图像
// const processGifImage = async function processGifImage(
//   inputImg: Buffer,
// ): Promise<Buffer> {
//   const result: Buffer[] = []
//   const hands = await loadHandImages()
//   const [hands1, input2] = await tools.gifTools.align2Gif(hands, inputImg)
//   for (let i = 0; i < hands1.length; i++) {
//     const src = hands1[i]
//     const index = i % frames.length
//     const frame = frames[index]
//     const join: any[] = [
//       { img: src, frameData: {} },
//       { img: input2[i], frameData: { ...frame, blendOption: 'dest-over' } },
//     ]
//     const result_ = await tools.imageTools.compose(join)
//     result.push(result_)
//   }
//   const gif = await tools.gifTools.pngsToGifBuffer_ffmpeg(result)
//   return gif
// }

export default craftPetpetGif
