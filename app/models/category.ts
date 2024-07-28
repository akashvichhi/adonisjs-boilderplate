import {
  afterDelete,
  BaseModel,
  beforeCreate,
  belongsTo,
  column,
  hasMany,
} from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import Product from './product.js'
import User from './user.js'

export default class Category extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  declare id: number

  @column()
  declare uuid: string

  @column({ serializeAs: null })
  declare userId: number

  @column()
  declare name: string

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(category: Category) {
    category.uuid = randomUUID()
  }

  @afterDelete()
  static async deleteProducts(category: Category) {
    await category.related('products').query().delete()
  }

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Product)
  declare products: HasMany<typeof Product>
}
