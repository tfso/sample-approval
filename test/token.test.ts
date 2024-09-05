import 'dotenv/config'
import { describe, it, expect, expectTypeOf } from 'vitest'

import { fetchToken, getAccessToken } from '../src/token'


describe('token', () => {

    const clients = {
        'Test Client': +process.env.TEST_CLIENT!
    }

    it('should fetch a fresh token', async () => {
        const token = await fetchToken(clients['Test Client'])
        expect(token).toBeDefined()
        expectTypeOf(token.expires_at).toBeString
        expectTypeOf(token.access_token).toBeString
        expect(new Date(token.expires_at).toISOString()).toEqual(token.expires_at)
    })

    it('should fetch a cached token', async () => {
        const token1 = await getAccessToken(clients['Test Client'])
        const token2 = await getAccessToken(clients['Test Client'])
        expect(token1).toEqual(token2)
    })
})
