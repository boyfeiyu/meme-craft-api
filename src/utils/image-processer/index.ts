import sharp from 'sharp'

const background = { r: 0, g: 0, b: 0, alpha: 0 } as const

export const isPng = (inputImage: Buffer): boolean => {
  const pngFileHeader = [
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ] as const

  if (inputImage.length <= pngFileHeader.length) {
    return false
  }

  const pngHeaderBuffer = Buffer.from(pngFileHeader)
  const startPosition = 0
  const endPosition = 8
  return (
    inputImage.compare(
      pngHeaderBuffer,
      startPosition,
      endPosition,
      startPosition,
      endPosition,
    ) === 0
  )
}

const getCirCleSharp = (radius: number) => {
  const svgStr = `
      <svg>
        <circle
          cx="${radius}"
          cy="${radius}"
          r="${radius}"
          fill="white"
        />
      </svg>
    `
  const circleShape = Buffer.from(svgStr)
  return circleShape
}

export const cropToCircle = async (
  inputImage: Buffer,
): Promise<Buffer | undefined> => {
  try {
    const image = sharp(inputImage)
    const { width, height } = await image.metadata()

    if (!width || !height) {
      throw new Error('无法获取图像尺寸')
    }

    const size = Math.min(width, height)
    const circleShape = getCirCleSharp(size / 2)

    // 将圆形蒙版和图像使用 dest-in 模式合成，实现保留圆形，周围变透明的裁切效果
    const outImage = await image
      .resize(size, size, { fit: 'cover', position: 'center' })
      .composite([
        {
          input: circleShape,
          blend: 'dest-in',
        },
      ])
      .png()
      .toBuffer()
    return outImage
  } catch (error) {
    console.error('error in cropToCircle:', error)
  }
}

// 旋转图像
export const rotateImage = async (inputImage: Buffer, rotation: number) => {
  const rotatedBuffer = await sharp(inputImage)
    .rotate(rotation, {
      background,
    })
    .toBuffer()

  return rotatedBuffer
}

/**
 * 透视旋转
 * @param input 待处理图像的 Buffer
 * @param options 透视旋转的选项
 * @param options.shearX X 轴方向的倾斜角度（可选）
 * @param options.shearY Y 轴方向的倾斜角度（可选）
 * @param options.rotation 旋转角度（可选）
 * @returns 处理后的图像 Buffer
 */
export const perspectiveStretching = async (
  inputImage: Buffer,
  options: { shearX?: number; shearY?: number; rotation?: number } = {},
): Promise<Buffer> => {
  const { shearX = 0, shearY = 0, rotation = 0 } = options

  // 将角度转换为弧度
  const shearXRadians = (shearX * Math.PI) / 180 // X 轴方向倾斜
  const shearYRadians = (shearY * Math.PI) / 180 // Y 轴方向倾斜

  // 使用 sharp 进行仿射变换
  const transformedBuffer = await sharp(inputImage)
    .affine(
      [
        [1, Math.tan(shearXRadians)],
        [Math.tan(shearYRadians), 1],
      ],
      {
        background,
      },
    )
    .toBuffer()

  // 平面旋转图像
  const rotatedBuffer = await rotateImage(transformedBuffer, rotation)

  return rotatedBuffer
}

/**
 * 数组第一个图像作为图像的原始数据，其余图像按照混合参数参与合成
 * 合成顺序：缩放，平面旋转，透视旋转，叠图选项
 * @param join
 */
export async function pngCompose(join: any[]) {
  // 按顺序将图像叠放 第一张图像大小设置为图像尺寸
  let curImg = join[0].img
  let fit = 'cover'
  // 将数组第一个元素剔除
  join.shift()
  for (const frame of join) {
    let img = frame.img
    fit = frame.frameData.resizeFit ? frame.frameData.resizeFit : fit
    const _background = frame.frameData.resizeBackground
      ? frame.frameData.resizeBackground
      : background
    // 缩放宽高
    if (frame.frameData.width && frame.frameData.height) {
      img = await sharp(img)
        .resize(frame.frameData.width, frame.frameData.height, {
          fit: fit as any,
          background: _background,
        })
        .png()
        .toBuffer()
    }
    // 旋转
    if (frame.frameData.rotate) {
      img = await sharp(img)
        .rotate(frame.frameData.rotate, { background: _background })
        .toBuffer()
    }
    if (frame.frameData.canvas) {
      img = await perspectiveStretching(img, frame.frameData.canvas.p_rotate)
    }
    const frameData = frame.frameData
    curImg = await sharp(curImg)
      .composite([
        {
          input: img,
          left: frameData.x || 0,
          top: frameData.y || 0,
          blend: frameData.blendOption || 'over',
        },
      ])
      .png()
      .toBuffer()
  }
  return curImg
}
