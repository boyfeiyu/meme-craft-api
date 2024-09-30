import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { MemesService } from './memes.service'
import { FilesInterceptor } from '@nestjs/platform-express'

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
  ) {
    console.log(texts, 'texts')
    console.log(files, 'files')

    const parsedTexts = JSON.parse(texts)

    // 处理文件
    console.log(
      'Received files:',
      files.map((file) => file.originalname),
    )

    // 处理文本
    console.log('Received texts:', parsedTexts)

    // 这里可以添加你的业务逻辑
    // 例如保存文件到磁盘或云存储，处理文本数据等

    return {
      message: 'Upload successful',
      filesCount: files.length,
      textsCount: parsedTexts.length,
    }
  }
}
