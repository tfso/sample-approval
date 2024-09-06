import { writeFile, readFile } from 'fs/promises'
import { JWTToken } from './types'


export async function fetchToken(organizationClientId: number, audience: string): Promise<JWTToken> {
    const client_secret = process.env.APPLICATION_CLIENT_SECRET
    const client_id = process.env.APPLICATION_CLIENT_ID
    //const audience = 'https://accounting.24sevenoffice.com'
    //const audience = 'https://api.24sevenoffice.com'
    const params = {
        grant_type: 'client_credentials',
        client_id,
        client_secret,
        login_organization: organizationClientId,
        audience
    }
    const res = await fetch('https://login.24sevenoffice.com/oauth/token', {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (!res.ok) {
        throw new Error(`Could not get token: ${res.status} ${res.statusText} - ${await res.text()}`)
    }
    const result = await res.json()
    return {
        access_token: result.access_token,
        expires_at: new Date(Date.now() + result.expires_in * 1000).toISOString(),
        scope: result.scope
    }
}

export async function getAccessToken(organizationClientId: number, audience: string): Promise<JWTToken> {
    const cacheFile = `token-${organizationClientId}-${audience.split('//')[1]}.cache`
    try {
        const token = JSON.parse(await readFile(cacheFile, 'utf-8')) as JWTToken
        if (new Date(token.expires_at) > new Date()) {
            return token
        }
        throw new Error('Token not found or expired')
    } catch (error) {
        const token = await fetchToken(organizationClientId, audience)
        await writeFile(cacheFile, JSON.stringify(token), 'utf-8')
        return token
    }
}

export async function getApprovalToken(organizationClientId: number): Promise<JWTToken> {
    return getAccessToken(organizationClientId, 'https://accounting.24sevenoffice.com')
}

export async function getAPIToken(organizationClientId: number): Promise<JWTToken> {
    return getAccessToken(organizationClientId, 'https://api.24sevenoffice.com')
}