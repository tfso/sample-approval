import { Approver, ApproverStatus, Identity, JWTToken, Voucher } from './types'
const apiUrl = 'https://voucher.api.24sevenoffice.com'
//const apiUrl = 'https://voucher.api.pre-prod.tfso.io'

function getAuthHeaders({ id, token }: { id: Identity, token: JWTToken }): HeadersInit {
    const { clientId, profileId } = id

    return {
        'X-Tfso-License': `${profileId ?? ''};${clientId};`,
        'Authorization': `Bearer ${token.access_token}`
    }

}
export async function getVouchersForApproval({ id, token }: { id: Identity, token: JWTToken }): Promise<Voucher[]> {
    const searchParams = [
        {
            Model: {
                statuses: { approval: "Processing" }
            }
        },
        {
            Operator: "GreaterThan",
            Model: {
                documentId: 0
            }
        }
    ]
    //const url = `${apiUrl}/vouchers/?search=%5B%7B%22Model%22%3A%7B%22statuses%22%3A%7B%22approval%22%3A%22Processing%22%7D%7D%7D%2C%7B%22Operator%22%3A%22GreaterThan%22%2C%22Model%22%3A%7B%22documentId%22%3A0%7D%7D%5D`
    const search = true ? encodeURIComponent(JSON.stringify(searchParams)) : ''

    const url = `${apiUrl}/vouchers/?search=${search}`

    const headers = getAuthHeaders({ id, token })
    const res = await fetch(url, {
        headers
    })
    if (!res.ok) {
        throw new Error(`Failed to get vouchers for approval: ${res.status} - ${res.statusText}: ${await res.text()}`)
    }
    const json = await res.json()
    return json
}

export async function handleVoucher({ id, token, voucherId, approverId, comment, status }: { id: Identity, token: JWTToken, voucherId: string, approverId: string, comment: string, status: ApproverStatus }): Promise<Approver> {
    const url = `${apiUrl}/vouchers/${voucherId}/approvers/${approverId}`
    const res = await fetch(url, {
        method: 'PATCH',
        headers: {
            ...getAuthHeaders({ id, token }),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, comment })
    })

    if (!res.ok) {
        throw new Error(`Failed to approve voucher: ${res.status} - ${res.statusText}: ${await res.text()}`)
    }
    const json = await res.json()
    return json
}

export async function changeStatus({ id, token, voucherId, status }: { id: Identity, token: JWTToken, voucherId: string, status: string }): Promise<any> {
    const url = `${apiUrl}/vouchers/${voucherId}`
    const res = await fetch(url, {
        method: 'PATCH',
        headers: {
            ...getAuthHeaders({ id, token }),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statuses: { approval: status } })
    })
    if (!res.ok) {
        throw new Error(`Failed to change status: ${res.status} - ${res.statusText}: ${await res.text()}`)
    }
    const json = await res.json()
    return json
}
