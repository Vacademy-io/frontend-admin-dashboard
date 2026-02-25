// Shared demo/mock data for Fee Management V2
// Replace with real API calls when backend is ready

import { ComplexPaymentOption, FeeType, AssignedFeeValue, AftInstallment } from '../-types';

export const MOCK_CPOS: ComplexPaymentOption[] = [
    { id: 'cpo-1', name: 'Standard Package 2025-26', status: 'ACTIVE' },
    { id: 'cpo-2', name: 'Hostel Package', status: 'ACTIVE' },
    { id: 'cpo-3', name: 'Transport Add-on', status: 'INACTIVE' },
];

export const MOCK_FEE_TYPES: FeeType[] = [
    {
        id: 'ft-1',
        name: 'Tuition Fee',
        code: 'TF',
        description: 'Annual academic fee',
        cpo_id: 'cpo-1',
        status: 'ACTIVE',
    },
    {
        id: 'ft-2',
        name: 'Lab Fee',
        code: 'LF',
        description: 'Science lab usage',
        cpo_id: 'cpo-1',
        status: 'ACTIVE',
    },
    {
        id: 'ft-3',
        name: 'Activity Fee',
        code: 'AF',
        description: 'Sports & extracurricular',
        cpo_id: 'cpo-1',
        status: 'INACTIVE',
    },
    {
        id: 'ft-4',
        name: 'Hostel Room Fee',
        code: 'HRF',
        description: 'Room boarding charges',
        cpo_id: 'cpo-2',
        status: 'ACTIVE',
    },
    {
        id: 'ft-5',
        name: 'Mess Fee',
        code: 'MF',
        description: 'Food charges',
        cpo_id: 'cpo-2',
        status: 'ACTIVE',
    },
    {
        id: 'ft-6',
        name: 'Bus Fee',
        code: 'BF',
        description: 'Route transport charges',
        cpo_id: 'cpo-3',
        status: 'ACTIVE',
    },
];

export const MOCK_AFVS: AssignedFeeValue[] = [
    {
        id: 'afv-1',
        fee_type_id: 'ft-1',
        amount: 60000,
        has_installment: true,
        is_refundable: false,
        has_penalty: true,
        penalty_percentage: 5,
        status: 'ACTIVE',
    },
    {
        id: 'afv-2',
        fee_type_id: 'ft-2',
        amount: 5000,
        has_installment: false,
        is_refundable: false,
        has_penalty: false,
        status: 'ACTIVE',
    },
    {
        id: 'afv-3',
        fee_type_id: 'ft-4',
        amount: 48000,
        has_installment: true,
        is_refundable: true,
        has_penalty: false,
        status: 'ACTIVE',
    },
];

export const MOCK_INSTALLMENTS: AftInstallment[] = [
    {
        id: 'inst-1',
        assigned_fee_value_id: 'afv-1',
        installment_number: 1,
        amount: 20000,
        due_date: '2025-04-15',
        status: 'PAID',
    },
    {
        id: 'inst-2',
        assigned_fee_value_id: 'afv-1',
        installment_number: 2,
        amount: 20000,
        due_date: '2025-08-15',
        status: 'PENDING',
    },
    {
        id: 'inst-3',
        assigned_fee_value_id: 'afv-1',
        installment_number: 3,
        amount: 20000,
        due_date: '2025-12-15',
        status: 'PENDING',
    },
    {
        id: 'inst-4',
        assigned_fee_value_id: 'afv-3',
        installment_number: 1,
        amount: 12000,
        due_date: '2025-04-01',
        status: 'PAID',
    },
    {
        id: 'inst-5',
        assigned_fee_value_id: 'afv-3',
        installment_number: 2,
        amount: 12000,
        due_date: '2025-07-01',
        status: 'PENDING',
    },
    {
        id: 'inst-6',
        assigned_fee_value_id: 'afv-3',
        installment_number: 3,
        amount: 12000,
        due_date: '2025-10-01',
        status: 'OVERDUE',
    },
    {
        id: 'inst-7',
        assigned_fee_value_id: 'afv-3',
        installment_number: 4,
        amount: 12000,
        due_date: '2026-01-01',
        status: 'PENDING',
    },
];
