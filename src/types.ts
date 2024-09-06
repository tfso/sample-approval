export type Identity = {
    clientId: number
    profileId?: string
}

export type JWTToken = {
    access_token: string
    expires_at: string
    scope: string
}

export type Voucher = {
    id: string
    numbers: number[]
    documentId: number
    source: {
        application: {
            id: string
            name?: string
        }
        identity: {
            id: string
            name?: string
        }
    }

    statuses: {
        retrieval: string
        approval: string
        analysis: string
        posting: string
        bank: string
    }
    postingType: string
    accountingParty: {
        id: number
        name: string
    } | null
    received: string
    timestamp: string
    amount: number
    invoiceNumber: string | null

    comment?: string
    tags?: string[]
    dimensions: {
        type: number
        value: string
        name: string
    }[]
    transactions: {
        id: string
        sequenceId: number
        accountNo: number | null
        vatCode: number
        amount: number
        currency: null
    }[] | null
    currency?: {
        symbol: string
        rate: number
    }
    date: string
    periodDate: null
    pages: {
        sequenceNumber: number
        voucherId: string
        previewUrl?: string
        thumbUrl?: string
        metaData: Record<string, string>
        key: string
        ocrMetadata?: string
        rotation: number
    }[]
    voucherTypeNo: number
    pageCount: number
    approvers: Approver[]
}

export type Approver = {
    id: string
    sequenceNumber: number
    notificationId: number | null
    type: string
    typeParameters: string
    identifier: string
    status: ApproverStatus
    comment: string
    friendlyName: string
    approvers: Approver[]
}

export type Person = {
    id: number
    identityId: string
    firstName: string
    lastName: string
    personType: string
    hasLicense: boolean
}

export type ApproverStatus = 'Awaiting' | 'Pending' | 'Approved' | 'Declined' | 'Forwarded'

