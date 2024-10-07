import sharp from 'sharp'
import GIFEncoder from 'gifencoder'
import { PNG } from 'pngjs'

export const isGif = (inputImage: Buffer): boolean => {
  const gif87aFileHeader = [0x47, 0x49, 0x46, 0x38, 0x37, 0x61] as const
  const gif89aFileHeader = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] as const
  const gifHeaderLength = 6

  if (inputImage.length <= gifHeaderLength) {
    return false
  }

  return (
    inputImage.compare(
      Buffer.from(gif87aFileHeader),
      0,
      gifHeaderLength,
      0,
      gifHeaderLength,
    ) === 0 ||
    inputImage.compare(
      Buffer.from(gif89aFileHeader),
      0,
      gifHeaderLength,
      0,
      gifHeaderLength,
    ) === 0
  )
}

export const pngsToGif = async (
  pngImages: Buffer[],
  gifData,
): Promise<Buffer> => {
  const { fps = 15 } = gifData
  if (pngImages.length === 0) {
    throw new Error('No images provided')
  }

  // 读取第一张图片以获取尺寸
  const firstImage = PNG.sync.read(pngImages[0])
  const { width, height } = firstImage

  // 创建 GIFEncoder 实例
  const encoder = new GIFEncoder(width, height)

  // 开始编码
  encoder.start()
  encoder.setRepeat(0) // 0 表示无限循环
  encoder.setDelay(fps) // 设置每帧之间的延迟，单位是毫秒
  encoder.setQuality(10) // 设置图像质量
  encoder.setTransparent(0x00000000) // 设置透明色

  // 添加每一帧
  for (const pngBuffer of pngImages) {
    const png = PNG.sync.read(pngBuffer)
    encoder.addFrame(png.data)
  }

  // 完成编码
  encoder.finish()

  // 获取生成的 GIF buffer
  return encoder.out.getData()
}

// export const extraGifToPngImages = async (
//   inputGif: Buffer,
// ): Promise<Buffer[]> => {
//   const pngImages: Buffer[] = []
//   const metadata = await sharp(inputGif)
//   if (!metadata.pages || metadata.pages === 0) {
//     throw new Error('GIF数据中无帧数据')
//   }
//   for (let i = 0; i < metadata.pages; i++) {
//     const frame = await sharp(inputGif, { page: i }).png().toBuffer()
//     pngImages.push(frame)
//   }
//   return pngImages
// }
