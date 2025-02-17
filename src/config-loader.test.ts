import { describe, expect, it } from 'vitest'
import { defineConfig, env, loadConfig } from './index.js'

const stubEnv = {
  NODE_ENV: 'development',
  HOST: 'localhost',
  SECRET: 'supersecret',
  PORT: '3000',
}

describe('config-loader', () => {
  it('throws if an env variable is missing', () => {
    const config = defineConfig({
      host: env('HOST'),
      missing: env('MISSING'),
    })

    expect(() => loadConfig(config, 'development', stubEnv)).toThrowError(
      'Missing environment variable: MISSING',
    )
  })

  it('throws if a switched env variable is missing', () => {
    const config = defineConfig({
      host: env('HOST'),
      missing: env({
        development: 'development',
        production: 'production',
      }),
    })

    expect(() => loadConfig(config, 'test', stubEnv)).toThrowError(
      'Enviroment "test" not found in switcher: "missing" and no default value provided',
    )
  })

  it('loads config with env variables', () => {
    const config = defineConfig({
      env: env('NODE_ENV'),
      nested: {
        host: env('HOST'),
        secret: env({
          development: env('SECRET'),
          production: 'production',
          default: 'defaultValue',
        }),
      },
      host: env({
        development: env('HOST'),
        production: 'example.com',
        default: 'defaultValue',
      }),
      withDefault: env({
        production: env('SECRET'),
        default: false,
      }),
      numb: 3000,
      bool: true,
    })
    expect(loadConfig(config, 'development', stubEnv)).toEqual({
      env: 'development',
      host: 'localhost',
      nested: {
        host: 'localhost',
        secret: 'supersecret',
      },
      withDefault: false,
      bool: true,
      numb: 3000,
    })

    expect(loadConfig(config, 'production', stubEnv)).toEqual({
      env: 'development',
      host: 'example.com',
      nested: {
        host: 'localhost',
        secret: 'production',
      },
      withDefault: 'supersecret',
      bool: true,
      numb: 3000,
    })

    expect(loadConfig(config, 'test', stubEnv)).toEqual({
      env: 'development',
      host: 'defaultValue',
      nested: {
        host: 'localhost',
        secret: 'defaultValue',
      },
      withDefault: false,
      numb: 3000,
      bool: true,
    })
  })
})
