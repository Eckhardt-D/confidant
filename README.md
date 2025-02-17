# Confidant - Typesafe Config Definer and Loader

Confidant is a library that allows you to define and load configuration files in a typesafe manner. 

## Installation

```bash
npm install @eckidevs/confidant
```

## Usage

### Define a configuration

The special `env` function can be used in 2 ways:

1. To load an environment variable directly
2. To switch between different values based on the environment

```typescript
import { defineConfig, env } from '@eckidevs/confidant';

export const configDefinition = defineConfig({
  staticValue: 'Hello, World!',
  fromEnvironment: env('SOME_ENV_VAR'), // throws if the environment variable is not set
  basedOnEnvironment: env({
    development: 'STATIC DEV VALUE',
    production: env('PRODUCTION_ENV_VAR'),
    default: 'DEFAULT VALUE', // If no default is set and the environment is not found, an error will be thrown
  }),
})
```

### Load a configuration

```typescript
import { loadConfig } from '@eckidevs/confidant';
import { configDefinition } from './config';

// 'development' can be replaced with e.g. process.env.NODE_ENV
const config = loadConfig(configDefinition, 'development', process.env);
/*
  {
    staticValue: 'Hello, World!',
    fromEnvironment: 'value of process.env.SOME_ENV_VAR',
    basedOnEnvironment: 'STATIC DEV VALUE', (because we passed 'development' as the environment)
  }
*/
```

In the example above, if we switch the environment to `production`, `basedOnEnvironment` will be set to the value of `process.env.PRODUCTION_ENV_VAR`.


