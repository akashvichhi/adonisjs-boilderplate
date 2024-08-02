/*
|--------------------------------------------------------------------------
| HTTP server entrypoint
|--------------------------------------------------------------------------
|
| The "server.ts" file is the entrypoint for starting the AdonisJS HTTP
| server. Either you can run this file directly or use the "serve"
| command to run this file and monitor file changes
|
*/

import env from '#start/env'
import { Ignitor, prettyPrintError } from '@adonisjs/core'
import http from 'node:http'
import https from 'node:https'
import 'reflect-metadata'

/**
 * URL to the application root. AdonisJS need it to resolve
 * paths to file and directories for scaffolding commands
 */
const APP_ROOT = new URL('../', import.meta.url)

/**
 * The importer is used to import files in context of the
 * application.
 */
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    app.booting(async () => {
      await import('#start/env')
    })
    app.listen('SIGTERM', () => app.terminate())
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
    app.ready(async () => {
      await import('#start/scheduler')

      const ace = await app.container.make('ace')
      await ace.exec('scheduler:run', [])
    })
  })
  .httpServer()
  .start((handler) => {
    const isHttpsEnable = env.get('IS_HTTPS_ENABLE')
    if (isHttpsEnable) {
      const keyFile = env.get('HTTPS_KEY_FILE')
      const crtFile = env.get('HTTPS_CERT_FILE')

      return https.createServer(
        {
          key: keyFile,
          cert: crtFile,
        },
        handler
      )
    }
    return http.createServer({}, handler)
  })
  .catch((error) => {
    process.exitCode = 1
    prettyPrintError(error)
  })
