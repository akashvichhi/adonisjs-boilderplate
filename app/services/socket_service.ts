import env from '#start/env'
import { createServer } from 'node:http'
import { Socket, Server as SocketIOServer } from 'socket.io'

export class SocketService {
  private booted: boolean = false
  declare io: SocketIOServer
  declare socket: Socket

  constructor() {
    if (this.booted) {
      return
    }

    this.booted = true
    const server = createServer()
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*',
      },
    })
    this.io.on('connection', (socket) => {
      this.socket = socket
    })
    server.listen(env.get('SOCKET_PORT'))
    process.on('SIGTERM', () => {
      this.io.close()
      server.close(() => {
        process.exit(0)
      })
    })
    process.on('SIGINT', () => {
      this.io.close()
      server.close(() => {
        process.exit(0)
      })
    })
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data)
  }
}

const socketService = new SocketService()

export default socketService
