import User from '#models/user'
import Category from '#models/category'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class CategoryPolicy extends BasePolicy {
  /**
   * Only category creator can edit the category
   */
  edit(user: User, category: Category): AuthorizerResponse {
    return user.id === category.userId
  }

  /**
   * Only category creator can delete the category
   */
  delete(user: User, category: Category): AuthorizerResponse {
    return user.id === category.userId
  }
}
