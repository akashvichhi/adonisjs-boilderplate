import vine from '@vinejs/vine'

/**
 * Validate the login request
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string().trim(),
  })
)

/**
 * Validate the register request
 */
export const registerValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    email: vine.string().trim().email(),
    password: vine.string().trim(),
  })
)

/**
 * Validate the forgot password request
 */
export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
  })
)

/**
 * Validate the reset password request
 */
export const resetPasswordValidator = vine.compile(
  vine.object({
    token: vine.string().trim(),
    password: vine.string().trim(),
  })
)
