import { UserRole } from '#config/constant'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { compose } from '@adonisjs/core/helpers'
import stringHelpers from '@adonisjs/core/helpers/string'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import Category from './category.js'
import PasswordReset from './password_reset.js'
import Role from './role.js'
import Product from './product.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true, serializeAs: null })
  declare id: number

  @column()
  declare uuid: string

  @column({ serializeAs: null })
  declare roleId: number

  @column()
  declare name: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)

  @hasMany(() => PasswordReset, {
    foreignKey: 'tokenableId',
    serializeAs: null,
  })
  declare passwordResets: HasMany<typeof PasswordReset>

  @belongsTo(() => Role, {
    serializeAs: null,
  })
  declare role: BelongsTo<typeof Role>

  @beforeCreate()
  static assignUuid(user: User) {
    user.uuid = randomUUID()
  }

  generateAccessToken() {
    return User.accessTokens.create(this, ['*'], {
      expiresIn: '30d',
    })
  }

  removeAccessToken(id: string) {
    return User.accessTokens.delete(this, id)
  }

  async generatePasswordResetToken() {
    const token = stringHelpers.random(32)
    const passwordReset = await (this as User).related('passwordResets').create({
      token,
    })
    return passwordReset
  }

  async isAdmin() {
    await (this as User).load('role')
    return this.role.name === UserRole.Admin
  }

  @hasMany(() => Category, {
    serializeAs: null,
  })
  declare categories: HasMany<typeof Category>

  @hasMany(() => Product, {
    serializeAs: null,
  })
  declare products: HasMany<typeof Product>
}
