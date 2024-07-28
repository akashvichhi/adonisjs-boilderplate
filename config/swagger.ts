import path from 'node:path'
import url from 'node:url'

export default {
  path: path.dirname(url.fileURLToPath(import.meta.url)) + '/../',
  tagIndex: 2,
  info: {
    title: 'Demo App',
    version: '1.0.0',
    description: 'This is an demo application using AdonisJs with Swagger',
  },
  snakeCase: true,
  debug: false,
  ignore: ['/swagger', '/docs'],
  preferredPutPatch: 'PUT',
  common: {
    parameters: {},
    headers: {},
  },
  authMiddlewares: ['auth', 'auth:api'],
  defaultSecurityScheme: 'BearerAuth',
  securitySchemes: {
    BasicAuth: {},
    ApiKeyAuth: {},
  },
  persistAuthorization: true,
  showFullPath: false,
}
