import { UserRole } from '#config/constant'
import Role from '#models/role'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import getPaginatedJSON from '../helpers/pagination_helper.js'

export default class UsersController {
  /**
   * @index
   * @paramQuery page - Page - @type(number)
   * @paramQuery limit - Per Page - @type(number)
   * @paramQuery search - Search - @type(string)
   * @responseBody 200 - {"message": "string", "data": { "users":  "<User[]>.paginated()" }} - Users list
   * @responseBody 401 - {"message": "string"} - Unauthorized
   * @responseBody 403 - {"message": "string"} - Forbidden
   * @responseBody 500 - {"message": "string"} - Internal server error
   */
  async index({ request, response }: HttpContext) {
    const search = request.input('search')
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const userRole = (await Role.findBy('name', UserRole.User))!
    const usersQuery = User.query().where('roleId', userRole.id)

    if (search) {
      usersQuery.where((query) => {
        query.where('name', 'like', `%${search}%`).orWhere('email', 'like', `%${search}%`)
      })
    }

    const users = getPaginatedJSON(await usersQuery.paginate(page, limit))

    return response.send({
      message: 'Users retrieved successfully',
      data: {
        users,
      },
    })
  }
}
