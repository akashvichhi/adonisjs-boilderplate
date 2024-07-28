import Category from '#models/category'
import Product from '#models/product'
import CategoryPolicy from '#policies/category_policy'
import ProductPolicy from '#policies/product_policy'
import { productValidator } from '#validators/product'
import type { HttpContext } from '@adonisjs/core/http'
import getPaginatedJSON from '../helpers/pagination_helper.js'

export default class ProductsController {
  /**
   * @index
   * @paramQuery page - Page - @type(number)
   * @paramQuery limit - Per Page - @type(number)
   * @paramQuery search - Search - @type(string)
   * @responseBody 200 - {"message": "string", "data": { "products":  "<Product[]>.paginated()" }} - Products list
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

    const productsQuery = user.related('products').query().preload('category').orderBy('id', 'desc')

    if (search) {
      productsQuery.where((query) => {
        query
          .where('name', 'like', `%${search}%`)
          .orWhere('excerpt', 'like', `%${search}%`)
          .orWhere('description', 'like', `%${search}%`)
      })
    }

    const products = getPaginatedJSON(await productsQuery.paginate(page, limit))

    return response.send({
      message: 'Products retrieved successfully',
      data: {
        products,
      },
    })
  }

  /**
   * @store
   * @summary Create a new product
   * @requestBody {"category_uuid": "", "name": "", "excerpt": "", "description": "", "price": ""}
   * @responseBody 204 -  - Product created
   * @responseBody 401 - {"message": "string"} - Unauthorized
   * @responseBody 403 - {"message": "string"} - Forbidden
   * @responseBody 500 - {"message": "string"} - Internal server error
   *
   * Handle form submission for the create action
   */
  async store({ auth, bouncer, request, response }: HttpContext) {
    const payload = await request.validateUsing(productValidator)
    const user = auth.user!

    let category: Category | null = null
    if (payload.category_uuid) {
      category = await Category.query().where('uuid', payload.category_uuid).first()
      if (!category) {
        return response.notFound({ message: 'Category not found' })
      }
      // Check if the user has permission to access the category
      if (await bouncer.with(CategoryPolicy).denies('edit', category)) {
        return response.forbidden({ message: 'Forbidden' })
      }
    }

    await user.related('products').create({
      categoryId: category?.id,
      name: payload.name,
      excerpt: payload.excerpt,
      description: payload.description,
      price: payload.price,
    })

    return response.noContent()
  }

  /**
   * @show
   * @summary Show a product details
   * @responseBody 200 - {"message": "string", "data": { "product":  "<Product>" }} - Product details
   * @responseBody 401 - {"message": "string"} - Unauthorized
   * @responseBody 404 - {"message": "string"} - Not found
   * @responseBody 500 - {"message": "string"} - Internal server error
   *
   * Display a single resource
   */
  async show({ params, response }: HttpContext) {
    const product = await Product.query()
      .where('uuid', params.uuid)
      .preload('category')
      .firstOrFail()
    return response.send({
      message: 'Product retrieved successfully',
      data: {
        product,
      },
    })
  }

  /**
   * @update
   * @summary Update a product
   * @requestBody {"category_uuid": "", "name": "", "excerpt": "", "description": "", "price": ""}
   * @responseBody 204 -  - Product updated
   * @responseBody 401 - {"message": "string"} - Unauthorized
   * @responseBody 403 - {"message": "string"} - Forbidden
   * @responseBody 404 - {"message": "string"} - Not found
   * @responseBody 500 - {"message": "string"} - Internal server error
   *
   * Handle form submission for the edit action
   */
  async update({ bouncer, params, request, response }: HttpContext) {
    const product = await Product.query().where('uuid', params.uuid).firstOrFail()
    if (await bouncer.with(ProductPolicy).denies('edit', product)) {
      return response.forbidden({ message: 'Forbidden' })
    }

    const payload = await request.validateUsing(productValidator)

    let category: Category | null = null
    if (payload.category_uuid) {
      category = await Category.query().where('uuid', payload.category_uuid).first()
      if (!category) {
        return response.notFound({ message: 'Category not found' })
      }
      // Check if the user has permission to access the category
      if (await bouncer.with(CategoryPolicy).denies('edit', category)) {
        return response.forbidden({ message: 'Forbidden' })
      }
    }

    await product
      .merge({
        categoryId: category?.id,
        name: payload.name,
        excerpt: payload.excerpt,
        description: payload.description,
        price: payload.price,
      })
      .save()

    return response.noContent()
  }

  /**
   * @destroy
   * @summary Delete a product
   * @responseBody 204 -  - Product deleted
   * @responseBody 401 - {"message": "string"} - Unauthorized
   * @responseBody 403 - {"message": "string"} - Forbidden
   * @responseBody 404 - {"message": "string"} - Not found
   * @responseBody 500 - {"message": "string"} - Internal server error
   *
   * Delete record
   */
  async destroy({ bouncer, params, response }: HttpContext) {
    const product = await Product.query().where('uuid', params.uuid).firstOrFail()
    if (await bouncer.with(ProductPolicy).denies('delete', product)) {
      return response.forbidden({ message: 'Forbidden' })
    }

    await product.delete()

    return response.noContent()
  }
}
