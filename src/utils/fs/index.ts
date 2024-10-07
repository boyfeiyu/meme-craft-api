// import path from 'path'
// import { fileURLToPath } from 'url'

// // 获取当前文件的目录
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// // 向上查找到项目根目录（假设根目录有package.json文件）
// const findRootDir = (currentDir) => {
//   if (fs.existsSync(path.join(currentDir, 'package.json'))) {
//     return currentDir
//   }
//   const parentDir = path.dirname(currentDir)
//   if (parentDir === currentDir) {
//     throw new Error('找不到项目根目录')
//   }
//   return findRootDir(parentDir)
// }

// const rootDir = findRootDir(__dirname)
// const targetDir = path.join(
//   rootDir,
//   'src',
//   'utils',
//   'meme-creater',
//   'petpet',
//   'images',
// )
