import { LucidRow, ModelPaginatorContract } from '@adonisjs/lucid/types/model'

const getPaginatedJSON = <T extends LucidRow>(paginatedModel: ModelPaginatorContract<T>) => {
  const json = paginatedModel.toJSON()
  json.meta = {
    total: json.meta.total,
    perPage: json.meta.perPage,
    currentPage: json.meta.currentPage,
    firstPage: json.meta.firstPage,
    lastPage: json.meta.lastPage,
  }
  return json
}

export default getPaginatedJSON
