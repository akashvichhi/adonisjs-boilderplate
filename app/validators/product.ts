import vine from '@vinejs/vine'

/**
 * Validate the create and update product request
 */
export const productValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    price: vine.string().trim(),
    category_uuid: vine.string().trim().optional(),
    excerpt: vine.string().trim().optional(),
    description: vine.string().trim().optional(),
  })
)
