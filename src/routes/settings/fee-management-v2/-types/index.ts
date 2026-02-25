// Mirrors the DB schema for the CPO-based fee management system

export interface ComplexPaymentOption {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface FeeType {
    id: string;
    name: string;
    code: string;
    description?: string;
    cpo_id: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface AssignedFeeValue {
    id: string;
    fee_type_id: string;
    amount: number;
    has_installment: boolean;
    is_refundable: boolean;
    has_penalty: boolean;
    penalty_percentage?: number;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface AftInstallment {
    id: string;
    assigned_fee_value_id: string;
    installment_number: number;
    amount: number;
    due_date: string; // 'YYYY-MM-DD'
    status: 'PENDING' | 'PAID' | 'OVERDUE';
}
