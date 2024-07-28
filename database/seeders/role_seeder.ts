import { UserRole } from '#config/constant'
import Role from '#models/role'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Role.createMany([
      {
        name: UserRole.Admin,
      },
      {
        name: UserRole.User,
      },
    ])
  }
}
