import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import type { NextFn } from '@adonisjs/core/types/http'
import { Base64 } from 'js-base64'

export default class SwaggerAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { request, response } = ctx

    if (app.inProduction) {
      const authHeader = request.header('authorization')

      if (!authHeader || !authHeader.startsWith('Basic ')) {
        response.header('WWW-Authenticate', 'Basic')
        return response.status(401).send('Authorization required')
      }

      const base64Credentials = authHeader.split(' ')[1]
      const credentials = Base64.decode(base64Credentials).split(':')
      const [username, password] = credentials

      if (username === env.get('SWAGGER_USERNAME') && password === env.get('SWAGGER_PASSWORD')) {
        await next()
      } else {
        return response.status(401).send('Invalid credentials')
      }
    }

    return await next()
  }
}
