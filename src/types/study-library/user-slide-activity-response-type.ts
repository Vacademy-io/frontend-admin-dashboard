interface Sort {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
}

interface Pageable {
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
    offset: number;
    sort: Sort;
}

interface Video {
    id: string;
    start_time_in_millis: number;
    end_time_in_millis: number;
}

interface Document {
    id: string;
    start_time_in_millis: number;
    end_time_in_millis: number;
    page_number: number;
}

export interface ActivityContent {
    id: string;
    source_id: string;
    source_type: string;
    user_id: string;
    slide_id: string;
    start_time_in_millis: number;
    end_time_in_millis: number;
    percentage_watched: number;
    videos: Video[];
    documents: Document[];
    new_activity: boolean;
}

export interface ActivityResponse {
    totalPages: number;
    totalElements: number;
    pageable: Pageable;
    size: number;
    content: ActivityContent[];
    number: number;
    sort: Sort;
    numberOfElements: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}
