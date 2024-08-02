import { Approver, ApproverStatus, Identity, Auth, Voucher } from './types'
const apiUrl = 'https://voucher.api.24sevenoffice.com'

function getAuthHeaders({ id, auth }: { id: Identity, auth: Auth }): HeadersInit {
    const { clientId, profileId } = id
    const { token } = auth
    return {
        'X-Tfso-License': `${profileId};${clientId};`,
        'Authorization': `Bearer ${token}`
    }

}
export async function getVouchersForApproval({ id, auth }: { id: Identity, auth: Auth }): Promise<Voucher[]> {
    const search = [
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
    const url = `${apiUrl}/vouchers/?search=${encodeURIComponent(JSON.stringify(search))}`
    const res = await fetch(url, {
        headers: getAuthHeaders({ id, auth })
    })
    const json = await res.json()
    return json
}

export async function handleVoucher({ id, auth, voucherId, approverId, comment, status }: { id: Identity, auth: Auth, voucherId: string, approverId: string, comment: string, status: ApproverStatus }): Promise<Approver> {
    const url = `${apiUrl}/vouchers/${voucherId}/approvers/${approverId}`
    const res = await fetch(url, {
        method: 'PATCH',
        headers: {
            ...getAuthHeaders({ id, auth }),
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
