import vine from '@vinejs/vine'

/**
 * Validate the create and update category request
 */
export const categoryValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    description: vine.string().trim().optional(),
  })
)
