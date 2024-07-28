import socketService, { SocketService } from '#services/socket_service'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class SocketMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    ctx.socket = socketService
    return next()
  }
}

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    socket: SocketService
  }
}
