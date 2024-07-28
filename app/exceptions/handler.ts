import { pinoLogger } from '#config/logger'
import { errors as authErrors } from '@adonisjs/auth'
import { ExceptionHandler, HttpContext, errors as httpErrors } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { errors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      return ctx.response.status(error.status).send({
        message: error.messages[0].message,
      })
    }
    if (error instanceof authErrors.E_INVALID_CREDENTIALS) {
      return ctx.response.status(error.status).send({
        message: 'Invalid credentials',
      })
    }
    if (error instanceof authErrors.E_UNAUTHORIZED_ACCESS) {
      return ctx.response.status(error.status).send({
        message: 'Unauthorized',
      })
    }
    if (error instanceof httpErrors.E_ROUTE_NOT_FOUND || error instanceof errors.E_ROW_NOT_FOUND) {
      return ctx.response.status(404).send({
        message: 'Not found',
      })
    }
    pinoLogger().error(error)
    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
