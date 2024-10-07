import { Test, TestingModule } from '@nestjs/testing'
import { MemesController } from '../src/modules/memes/memes.controller'

describe('MemesController', () => {
  let controller: MemesController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemesController],
    }).compile()

    controller = module.get<MemesController>(MemesController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
