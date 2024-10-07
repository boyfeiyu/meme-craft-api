import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { MemesService } from './memes.service'
import { FilesInterceptor } from '@nestjs/platform-express'
import {
  cropToCircle,
  isPng,
  perspectiveStretching,
} from 'src/utils/image-processer'
import craftPetpetGif from 'src/utils/meme-creater/petpet'
import { isGif } from 'src/utils/image-processer/gif'

@Controller('memes')
export class MemesController {
  constructor(private readonly memesService: MemesService) {}

  @Get()
  findAll() {
    return this.memesService.findAll()
  }

  @Post('/test')
  @HttpCode(200)
  @UseInterceptors(FilesInterceptor('images'))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('texts') texts: string,
    @Res() res, // 添加 Response 对象
  ) {
    const parsedTexts = JSON.parse(texts)
    console.log('Received texts:', parsedTexts)
    console.log(
      'Received files:',
      files.map((file) => file.originalname),
    )

    const buffer0 = files[0].buffer

    // const circle = await cropToCircle(buffer0)

    // const test = await perspectiveStretching(buffer0, {
    //   shearX: 45,
    //   shearY: -45,
    //   rotation: 0,
    // })

    const res11 = await craftPetpetGif(buffer0)
    console.log(res11, 'res11')
    // 处理文本
    console.log(isPng(res11 as any), 'res11 is png')
    console.log(isGif(res11 as any), 'res11 is png')

    // 这里可以添加你的业务逻辑
    // 例如保存文件到磁盘或云存储，处理文本数据等
    res.set('Content-Type', 'image/gif')
    res.send(res11)
    // return {
    //   message: 'Upload successful',
    //   filesCount: files.length,
    //   textsCount: parsedTexts.length,
    //   resolvedImage: circleBase64,
    // }
  }
}
