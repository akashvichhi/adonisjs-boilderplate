import Category from '#models/category'
import CategoryPolicy from '#policies/category_policy'
import { categoryValidator } from '#validators/category'
import type { HttpContext } from '@adonisjs/core/http'
import getPaginatedJSON from '../helpers/pagination_helper.js'

export default class CategoriesController {
  /**
   * @index
   * @paramQuery page - Page - @type(number)
   * @paramQuery limit - Per Page - @type(number)
   * @paramQuery search - Search - @type(string)
   * @responseBody 200 - {"message": "string", "data": { "categories":  "<Category[]>.paginated()" }} - Categories list
   * @responseBody 401 - {"message": "string"} - Unauthorized
   * @responseBody 403 - {"message": "string"} - Forbidden
   * @responseBody 500 - {"message": "string"} - Internal server error
   *
   * Display a list of resource
   */
  async index({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const search = request.input('search')
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const categoriesQuery = user.related('categories').query().orderBy('id', 'desc')

    if (search) {
      categoriesQuery.where((query) => {
        query.where('name', 'like', `%${search}%`).orWhere('description', 'like', `%${search}%`)
      })
    }

    const categories = getPaginatedJSON(await categoriesQuery.paginate(page, limit))

    return response.send({
      message: 'Categories retrieved successfully',
      data: {
        categories,
      },
    })
  }

  /**
   * @store
   * @summary Create a new category
   * @requestBody {"name": "", "description": ""}
   * @responseBody 204 -  - Category created
   * @responseBody 401 - {"message": "string"} - Unauthorized
   * @responseBody 403 - {"message": "string"} - Forbidden
   * @responseBody 500 - {"message": "string"} - Internal server error
   *
   * Handle form submission for the create action
   */
  async store({ auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(categoryValidator)
    const user = auth.user!

    await user.related('categories').create(payload)

    return response.noContent()
  }

  /**
   * @update
   * @summary Update a category
   * @requestBody {"name": "", "description": ""}
   * @responseBody 204 -  - Category updated
   * @responseBody 401 - {"message": "string"} - Unauthorized
   * @responseBody 403 - {"message": "string"} - Forbidden
   * @responseBody 404 - {"message": "string"} - Not found
   * @responseBody 500 - {"message": "string"} - Internal server error
   *
   * Handle form submission for the edit action
   */
  async update({ bouncer, params, request, response }: HttpContext) {
    const category = await Category.query().where('uuid', params.uuid).firstOrFail()
    if (await bouncer.with(CategoryPolicy).denies('edit', category)) {
      return response.forbidden({ message: 'Forbidden' })
    }

    const payload = await request.validateUsing(categoryValidator)

    await category.merge(payload).save()

    return response.noContent()
  }

  /**
   * @destroy
   * @summary Delete a category
   * @responseBody 204 -  - Category deleted
   * @responseBody 401 - {"message": "string"} - Unauthorized
   * @responseBody 403 - {"message": "string"} - Forbidden
   * @responseBody 404 - {"message": "string"} - Not found
   * @responseBody 500 - {"message": "string"} - Internal server error
   *
   * Delete record
   */
  async destroy({ bouncer, params, response }: HttpContext) {
    const category = await Category.query().where('uuid', params.uuid).firstOrFail()
    if (await bouncer.with(CategoryPolicy).denies('delete', category)) {
      return response.forbidden({ message: 'Forbidden' })
    }

    await category.delete()

    return response.noContent()
  }
}
