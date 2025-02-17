export interface EnvVar<T extends string> { type: 'env', value: T }
export interface EnvSwitcher<E extends string, T extends string | EnvVar<string> | boolean | number> { type: 'switcher', value: Record<E, T> }

export function env<T extends string>(value: T): EnvVar<T>
export function env<E extends string, T extends string | EnvVar<string> | boolean | number>(switcher: Record<E, T>): EnvSwitcher<E, T>
export function env<T extends string, E extends string>(
  value: T | Record<E, T>,
): EnvVar<T> | EnvSwitcher<E, T> {
  if (typeof value === 'string') {
    return { type: 'env', value }
  }
  else {
    return { type: 'switcher', value }
  }
}

export function defineConfig<T extends Record<string, unknown>>(config: T): T {
  return config
}

// Utility type to resolve `env()` and `switcher` values at compile-time
type ResolvedConfig<T, E extends string> = {
  [K in keyof T]: T[K] extends EnvVar<string>
    ? string // Resolved env variable
    : T[K] extends EnvSwitcher<E, infer V>
      ? V // Resolved switcher value
      : T[K] extends Record<string, unknown>
        ? ResolvedConfig<T[K], E> // Recursively resolve nested objects
        : T[K]
}

// **Type Predicates for Narrowing**
function isEnvVar<T extends string>(value: any): value is EnvVar<T> {
  return value?.type === 'env'
}

function isEnvSwitcher<E extends string, T extends string>(
  value: any,
): value is EnvSwitcher<E, T> {
  return value?.type === 'switcher'
}

export function loadConfig<T, E extends string>(
  config: T,
  environment: E,
  processEnv: NodeJS.ProcessEnv,
): ResolvedConfig<T, E> {
  const result: any = {}

  for (const key in config) {
    const value = config[key]

    if (['string', 'number', 'boolean'].includes(typeof value)) {
      result[key] = value
    }
    else if (isEnvVar(value)) {
      const envVar = processEnv[value.value]
      if (envVar == null) {
        throw new Error(`Missing environment variable: ${value.value}`)
      }
      result[key] = envVar
    }
    else if (isEnvSwitcher(value)) {
      const possible = loadConfig(value.value, environment, processEnv)
      const envVar = possible[environment] ?? value.value.default
      if (envVar == null) {
        throw new Error(`Enviroment "${environment}" not found in switcher: "${key}" and no default value provided`)
      }
      result[key] = envVar
    }
    else if (typeof value === 'object') {
      result[key] = loadConfig(value, environment, processEnv)
    }
  }

  return result
}
