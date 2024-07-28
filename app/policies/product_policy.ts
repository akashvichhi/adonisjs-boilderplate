import User from '#models/user'
import Product from '#models/product'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class ProductPolicy extends BasePolicy {
  /**
   * Only product creator can edit the product
   */
  edit(user: User, product: Product): AuthorizerResponse {
    return user.id === product.userId
  }

  /**
   * Only product creator can delete the product
   */
  delete(user: User, product: Product): AuthorizerResponse {
    return user.id === product.userId
  }
}
