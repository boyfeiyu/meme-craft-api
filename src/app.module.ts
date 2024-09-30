import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { MemesModule } from './modules/memes/memes.module'

@Module({
  imports: [MemesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
