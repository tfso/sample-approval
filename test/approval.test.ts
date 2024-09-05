import 'dotenv/config'
import { describe, it, expect, expectTypeOf } from 'vitest'
import { changeStatus, getVouchersForApproval, handleVoucher } from '../src/approval'
import { Voucher } from '../src/types'
import { fetchToken, getAccessToken } from '../src/token'


describe('approval', () => {
    // insert your token here
    const token = process.env.JWT_TOKEN!


    const clients = {
        'Test Client': +process.env.TEST_CLIENT!
    }


    const profiles = {
        'Test Profile': process.env.TEST_PROFILE!
    }


    const auth = { token: token }
    async function getAuth() {
        return fetchToken(clients['Test Client'])

    }
    function expectVoucherToBeValid(voucher: Voucher) {
        expect(voucher).toHaveProperty('id')
        expect(voucher).toHaveProperty('numbers')
        expect(voucher).toHaveProperty('documentId')
        expect(voucher).toHaveProperty('source')
        expect(voucher.source).toHaveProperty('application')
        expect(voucher.source.application).toHaveProperty('id')
        expect(voucher.source.application).toHaveProperty('name')
        expect(voucher.source).toHaveProperty('identity')
        expect(voucher.source.identity).toHaveProperty('id')
        expect(voucher.source.identity).toHaveProperty('name')
        expect(voucher).toHaveProperty('statuses')
        expect(voucher.statuses).toHaveProperty('retrieval')
        expect(voucher.statuses).toHaveProperty('approval')
        expect(voucher.statuses).toHaveProperty('analysis')
        expect(voucher.statuses).toHaveProperty('posting')
        expect(voucher.statuses).toHaveProperty('bank')
        expect(voucher).toHaveProperty('postingType')
        expect(voucher).toHaveProperty('accountingParty')
        if (voucher.accountingParty !== null) {
            expect(voucher.accountingParty).toHaveProperty('id')
            expect(voucher.accountingParty).toHaveProperty('name')
        }
        expect(voucher).toHaveProperty('received')
        expect(voucher).toHaveProperty('timestamp')
        expect(voucher).toHaveProperty('amount')
        expect(voucher).toHaveProperty('invoiceNumber')
        expect(voucher).toHaveProperty('comment')
        expect(voucher).toHaveProperty('tags')
        expect(voucher).toHaveProperty('dimensions')
        if (voucher.dimensions) {
            expectTypeOf(voucher.dimensions).toBeArray()
            voucher.dimensions.forEach((dimension) => {
                expect(dimension).toHaveProperty('type')
                expect(dimension).toHaveProperty('value')
                expect(dimension).toHaveProperty('name')
            })
        }
        expect(voucher).toHaveProperty('transactions')
        if (voucher.transactions) {
            expectTypeOf(voucher.transactions).toBeArray
            voucher.transactions.forEach((transaction) => {
                expect(transaction).toHaveProperty('id')
                expect(transaction).toHaveProperty('sequenceId')
                expect(transaction).toHaveProperty('accountNo')
                expect(transaction).toHaveProperty('vatCode')
                expect(transaction).toHaveProperty('amount')
                expect(transaction).toHaveProperty('currency')
            })
        }
        expect(voucher).toHaveProperty('currency')
        if (voucher.currency) {
            expect(voucher.currency).toHaveProperty('symbol')
            expect(voucher.currency).toHaveProperty('rate')
        }
        expect(voucher).toHaveProperty('date')
        expect(voucher).toHaveProperty('periodDate')
        expect(voucher).toHaveProperty('pages')
        expectTypeOf(voucher.pages).toBeArray
        voucher.pages.forEach((page) => {
            expect(page).toHaveProperty('sequenceNumber')
            expect(page).toHaveProperty('voucherId')
            expect(page).toHaveProperty('metaData')
            expect(page).toHaveProperty('key')
            expect(page).toHaveProperty('rotation')
            expect(page).toHaveProperty('previewUrl')
            expect(page).toHaveProperty('thumbUrl')
            expect(page).toHaveProperty('ocrMetadata')
        })
        expect(voucher).toHaveProperty('voucherTypeNo')
        expect(voucher).toHaveProperty('pageCount')
        expect(voucher).toHaveProperty('approvers')
        expectTypeOf(voucher.approvers).toBeArray
        voucher.approvers.forEach((approver) => {
            expect(approver).toHaveProperty('id')
            expect(approver).toHaveProperty('sequenceNumber')
            expect(approver).toHaveProperty('notificationId')
            expect(approver).toHaveProperty('type')
            expect(approver).toHaveProperty('typeParameters')
            expect(approver).toHaveProperty('identifier')
            expect(approver).toHaveProperty('status')
            expect(approver).toHaveProperty('comment')
            expect(approver).toHaveProperty('friendlyName')
            expect(approver).toHaveProperty('approvers')
        })

    }


    it('should list all vouchers for approval', async () => {
        const clientId = clients['Test Client']
        const token = await getAccessToken(clientId)
        const vouchersForApprovalResult = await getVouchersForApproval({ token, id: { clientId } })
        expectTypeOf(vouchersForApprovalResult).toBeArray()
        vouchersForApprovalResult.forEach(v => expectVoucherToBeValid(v))
    })

    it('should approve a voucher with comment', async () => {
        const clientId = clients['Test Client']
        const profileId = profiles['Test Profile']
        const token = await getAccessToken(clientId)
        const vouchersForApprovalResult = await getVouchersForApproval({ token, id: { clientId, profileId } })
        const voucherToApprove = vouchersForApprovalResult[0]
        const ownApprover = voucherToApprove.approvers.find(approver => approver.identifier === profileId)
        if (!ownApprover)
            return
        await handleVoucher({
            token,
            id: { clientId, profileId },
            voucherId: voucherToApprove.id,
            comment: `Approved via API using a sample app - ${new Date().toISOString()}`,
            approverId: ownApprover.id,
            status: 'Approved'
        })
    })

    it('should reject a voucher with comment', async () => {
        const clientId = clients['Test Client']
        const profileId = profiles['Test Profile']
        const token = await getAccessToken(clientId)
        const vouchersForApprovalResult = await getVouchersForApproval({ token, id: { clientId, profileId } })
        const voucherToApprove = vouchersForApprovalResult[0]
        const ownApprover = voucherToApprove.approvers.find(approver => approver.identifier === profileId)
        if (!ownApprover)
            return
        await handleVoucher({
            token,
            id: { clientId, profileId },
            voucherId: voucherToApprove.id,
            comment: `Rejected via API using a sample app - ${new Date().toISOString()}`,
            approverId: ownApprover.id,
            status: 'Declined'
        })
    })

    it('should just change status without touching approver', async () => {
        const clientId = clients['Test Client']
        //const profileId = profiles['Test Profile']
        const token = await getAccessToken(clientId)
        const vouchersForApprovalResult = await getVouchersForApproval({ token, id: { clientId } })
        const voucherId = vouchersForApprovalResult[0].id
        //const voucherId = 'c3bbec68-86a7-4e31-81b7-58490de49425'
        await changeStatus({
            token,
            id: { clientId },
            voucherId,
            status: 'Completed'
        })
    })
})
