import { type Query, type QueryType, type Smash, Zero } from '@rocicorp/zero'
import { useZero, useQuery as useZeroQuery } from '@rocicorp/zero/react'
import { createEmitter } from '@vxrn/emitter'
import { type Schema, schema } from '~/zero/schema'

export let zero = createZero()

export const zeroEmitter = createEmitter<typeof zero>()
export const zeroEmit = zeroEmitter.emit
export const useZeroEmit = zeroEmitter.use

function createZero({ auth, userID = 'anon' }: { auth?: string; userID?: string } = {}) {
  return new Zero({
    userID,
    auth,
    server: import.meta.env.VITE_PUBLIC_ZERO_SERVER,
    schema,
    // This is often easier to develop with if you're frequently changing
    // the schema. Switch to 'idb' for local-persistence.
    kvStore: 'mem',
  })
}

export function setZeroAuth({ jwtToken, userID }: { jwtToken: string; userID: string }) {
  zero = createZero({
    auth: jwtToken,
    userID,
  })
  zeroEmit(zero)
}

export const mutate = zero.mutate

export type QueryResult<TReturn extends QueryType> = [
  Smash<TReturn>,
  {
    type: 'unknown' | 'complete'
  },
]

export function useQuery<
  QueryBuilder extends (z: Zero<Schema>['query']) => Query<any>,
  Q extends ReturnType<QueryBuilder>,
>(createQuery: QueryBuilder): Q extends Query<any, infer Return> ? QueryResult<Return> : never {
  const z = useZero<Schema>()
  return useZeroQuery(createQuery(z.query)) as any
}
