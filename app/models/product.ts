import { BaseModel, beforeCreate, belongsTo, column, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import Category from './category.js'
import User from './user.js'

export default class Product extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  declare id: number

  @column()
  declare uuid: string

  @column({ serializeAs: null })
  declare userId: number

  @column({ serializeAs: null })
  declare categoryId: number

  @column()
  declare name: string

  @column()
  declare excerpt: string

  @column()
  declare price: string

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(product: Product) {
    product.uuid = randomUUID()
  }

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  @computed({ serializeAs: 'category' })
  get categoryName(): string | null {
    return this.category?.name || null
  }
}
