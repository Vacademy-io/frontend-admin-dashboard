export interface CPOInstallment {
    id: string;
    installmentNumber: number;
    amount: number;
    dueDate: string;
    status: string;
}

export interface AssignedFeeValue {
    id: string;
    amount: number;
    noOfInstallments: number;
    hasInstallment: boolean;
    isRefundable: boolean;
    hasPenalty: boolean;
    penaltyPercentage: number | null;
    status: string;
    installments: CPOInstallment[];
}

export interface CPOFeeType {
    id: string;
    name: string;
    code: string;
    description: string;
    status: string;
    assignedFeeValue: AssignedFeeValue;
}

export interface CPOPackage {
    id: string;
    name: string;
    instituteId: string;
    defaultPaymentOptionId: string | null;
    status: string;
    feeTypes: CPOFeeType[];
}
