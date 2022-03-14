import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const currentDir = dirname(fileURLToPath(import.meta.url))
const root = join(currentDir, '../')

const audioDir = join(root, 'audio')
const publicDir = join(root, 'public')
const songsDir = join(audioDir, 'songs')
const fxDir = join(audioDir, 'fx')

export default {
  port: process.env.PORT || 3000,
  dir: {
    root,
    audioDir,
    publicDir,
    songsDir,
    fxDir
  },
  pages: {
    homeHTML: 'home/index.html',
    controllerHTML: 'controller/index.html'
  },
  location: {
    home: '/home'
  },
  constants: {
    CONTENT_TYPE: {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript'
    }
  }
}