import { UserRole } from '#config/constant'
import PasswordReset from '#models/password_reset'
import Role from '#models/role'
import User from '#models/user'
import {
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
} from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
// import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'

export default class AuthController {
  /**
   * @login
   * @requestBody {"email": "", "password": ""}
   * @responseBody 200 - {"message": "string", "data": { "user": "<User>", "access_token": "string" }} - Successful login
   * @responseBody 400 - {"message": "string"} - Invalid credentials
   * @responseBody 422 - {"message": "string"} - Validation error
   * @responseBody 500 - {"message": "string"} - Internal server error
   */
  async login({ request, response }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(payload.email, payload.password)
    await user.load('role')
    if (user.role.name !== UserRole.User) {
      return response.badRequest({
        message: 'Invalid credentials',
      })
    }
    const token = await user.generateAccessToken()

    return response.send({
      message: 'User logged in successfully',
      data: {
        user,
        access_token: token.value!.release(),
      },
    })
  }

  /**
   * @adminLogin
   * @summary Admin login
   * @description Admin login
   * @requestBody {"email": "", "password": ""}
   * @responseBody 200 - {"message": "string", "data": { "user": "<User>", "access_token": "string" }} - Successful admin login
   * @responseBody 400 - {"message": "string"} - Invalid credentials
   * @responseBody 422 - {"message": "string"} - Validation error
   * @responseBody 500 - {"message": "string"} - Internal server error
   */
  async adminLogin({ request, response }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(payload.email, payload.password)
    await user.load('role')
    if (user.role.name !== UserRole.Admin) {
      return response.badRequest({
        message: 'Invalid credentials',
      })
    }
    const token = await user.generateAccessToken()

    return response.send({
      message: 'Admin logged in successfully',
      data: {
        user,
        access_token: token.value!.release(),
      },
    })
  }

  /**
   * @register
   * @requestBody {"name": "", "email": "", "password": ""}
   * @responseBody 201 - {"message": "string", "data": { "access_token": "string" }} - Successful registration
   * @responseBody 400 - {"message": "string"} - Existing user
   * @responseBody 422 - {"message": "string"} - Validation error
   * @responseBody 500 - {"message": "string"} - Internal server error
   */
  async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)

    const exisistUser = await User.findBy('email', payload.email)
    if (exisistUser) {
      return response.badRequest({
        message: 'User already exists with this email address',
      })
    }

    const userRole = (await Role.findBy('name', UserRole.User))!
    const user = new User()
    user.name = payload.name
    user.email = payload.email
    user.password = payload.password
    user.roleId = userRole.id
    await user.save()

    const token = await user.generateAccessToken()

    return response.created({
      message: 'User registered successfully',
      data: {
        access_token: token.value!.release(),
      },
    })
  }

  /**
   * @logout
   * @responseBody 200 - {"message": "string"} - Successful logout
   * @responseBody 401 - {"message": "string"} - Unauthorized
   * @responseBody 403 - {"message": "string"} - Unauthorized
   * @responseBody 500 - {"message": "string"} - Internal server error
   */
  async logout({ response, auth }: HttpContext) {
    const user = auth.user
    user?.removeAccessToken(user.currentAccessToken.identifier as string)
    return response.send({
      message: 'User logged out successfully',
    })
  }

  /**
   * @forgotPassword
   * @requestBody {"email": ""}
   * @responseBody 200 - {"message": "string", "data": { "password_reset_token": "string" }} - Successful reset token generated
   * @responseBody 404 - {"message": "string"} - User not found
   * @responseBody 422 - {"message": "string"} - Validation error
   * @responseBody 500 - {"message": "string"} - Internal server error
   */
  async forgotPassword({ request, response }: HttpContext) {
    const payload = await request.validateUsing(forgotPasswordValidator)
    const user = await User.findBy('email', payload.email)
    if (!user) {
      return response.notFound({
        message: 'User does not exists with this email address',
      })
    }
    // const passwordReset = await user.generatePasswordResetToken()

    // await mail.send((message) => {
    //   message
    //     .to(user.email)
    //     .subject('Reset your password')
    //     .htmlView('emails/verify_email', { user, token: passwordReset.token })
    // })

    return response.send({
      message: 'Password reset link sent to your email',
    })
  }

  /**
   * @resetPassword
   * @requestBody {"token": "", "password": ""}
   * @responseBody 200 - {"message": "string"} - Successful reset password
   * @responseBody 400 - {"message": "string"} - Invalid password reset token
   * @responseBody 422 - {"message": "string"} - Validation error
   * @responseBody 500 - {"message": "string"} - Internal server error
   */
  async resetPassword({ request, response }: HttpContext) {
    const payload = await request.validateUsing(resetPasswordValidator)
    const passwordReset = await PasswordReset.findBy('token', payload.token)
    if (!passwordReset || passwordReset.createdAt < DateTime.now().minus({ minutes: 15 })) {
      return response.badRequest({
        message: 'Invalid password reset token',
      })
    }

    await passwordReset.load('user')
    const user = passwordReset.user!
    user.password = payload.password
    await user.save()

    passwordReset.delete()

    return response.send({
      message: 'Password reset successfully',
    })
  }
}
