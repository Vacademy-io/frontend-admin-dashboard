export interface InviteLinkInterface {
    totalPages: number;
    totalElements: number;
    numberOfElements: number;
    pageable: Pageable;
    size: number;
    content: InviteLinkDataInterface[];
    number: number;
    sort: Sort;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export interface Pageable {
    paged: boolean;
    unpaged: boolean;
    pageNumber: number;
    pageSize: number;
    offset: number;
    sort: Sort;
}

export interface Sort {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
}

export interface InviteLinkDataInterface {
    id: string;
    name: string;
    start_date: string; // ISO date string
    end_date: string; // ISO date string
    invite_code: string;
    status: string;
    institute_id: string;
    vendor: string;
    vendor_id: string;
    currency: string;
    tag: string;
    web_page_meta_data_json: string;
    institute_custom_fields: InstituteCustomField[];
    package_session_to_payment_options: PackageSessionToPaymentOption[];
}

export interface InstituteCustomField {
    id: string;
    institute_id: string;
    type: string;
    type_id: string;
    custom_field: CustomField;
}

export interface CustomField {
    guestId: string;
    id: string;
    fieldKey: string;
    fieldName: string;
    fieldType: string;
    defaultValue: string;
    config: string;
    formOrder: number;
    isMandatory: boolean;
    isFilter: boolean;
    isSortable: boolean;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    sessionId: string;
    liveSessionId: string;
    customFieldValue: string;
}

export interface PackageSessionToPaymentOption {
    package_session_id: string;
    payment_option: PaymentOption;
}

export interface PaymentOption {
    id: string;
    name: string;
    status: string;
    source: string;
    source_id: string;
    tag: string;
    type: string;
    require_approval: boolean;
    payment_plans: PaymentPlan[];
    payment_option_metadata_json: string;
}

export interface PaymentPlan {
    id: string;
    name: string;
    status: string;
    validity_in_days: number;
    actual_price: number;
    elevated_price: number;
    currency: string;
    description: string;
    tag: string;
    feature_json: string;
}
