import { Injectable } from '@nestjs/common'

@Injectable()
export class MemesService {
  findAll(): string {
    return 'This action returns all memes'
  }
}
