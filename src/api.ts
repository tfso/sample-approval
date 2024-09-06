import { Identity, JWTToken, Person } from "./types";

const apiUrl = 'https://rest.api.24sevenoffice.com'
export async function getPeople({ id, token }: { id: Identity, token: JWTToken }): Promise<Person[]> {

    const res = await fetch(`${apiUrl}/v1/organization/people`, {
        headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'X-Tfso-License': `;${id.clientId};`
        }
    })
    if (!res.ok)
        throw new Error(`Failed to get people: ${res.status} - ${res.statusText}: ${await res.text()}`)
    return await res.json()
}

