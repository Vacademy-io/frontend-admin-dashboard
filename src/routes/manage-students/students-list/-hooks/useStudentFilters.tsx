import { useState, useEffect, useCallback, useRef } from 'react';
import { StudentFilterRequest } from '@/types/student-table-types';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { useSelectedSessionStore } from '@/stores/study-library/selected-session-store';
import {
    DropdownItemType,
    DropdownValueType,
} from '@/components/common/students/enroll-manually/dropdownTypesForPackageItems';
import { useNavigate, useSearch } from '@tanstack/react-router';

export const useStudentFilters = () => {
    const navigate = useNavigate();
    const searchParams = useSearch({ strict: false }) as Record<string, any>;
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const data = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = data && Object.keys(data.authorities)[0];
    const { getAllSessions, instituteDetails } = useInstituteDetailsStore();
    const { selectedSession, setSelectedSession } = useSelectedSessionStore();
    const [columnFilters, setColumnFilters] = useState<
        { id: string; value: { id: string; label: string }[] }[]
    >([]);
    const [searchInput, setSearchInput] = useState<string>('');
    const [searchFilter, setSearchFilter] = useState('');
    const [clearFilters, setClearFilters] = useState<boolean>(false);
    const hasInitializedFilters = useRef(false);
    const [sessionList, setSessionList] = useState<DropdownItemType[]>(
        getAllSessions().map((session) => ({
            id: session.id,
            name: session.session_name,
        }))
    );
    const [currentSession, setCurrentSession] = useState<DropdownItemType>(() => {
        const defaultSession = sessionList[0] || { id: '', name: '' };
        return selectedSession && sessionList.find((session) => session.id === selectedSession.id)
            ? { id: selectedSession.id, name: selectedSession.session_name }
            : defaultSession;
    });

    useEffect(() => {
        setSessionList(
            getAllSessions().map((session) => ({
                id: session.id,
                name: session.session_name,
            }))
        );
        if (currentSession && sessionList.includes(currentSession)) {
            const session = getAllSessions().find((session) => session.id === currentSession.id);
            if (session) {
                setSelectedSession(session);
            }
        } else {
            const defaultSession = sessionList[0] || { id: '', name: '' };
            const newSession = selectedSession
                ? { id: selectedSession.id, name: selectedSession.session_name }
                : defaultSession;
            setCurrentSession(newSession);
            const session = getAllSessions().find((session) => session.id === newSession.id);
            if (session) {
                setSelectedSession(session);
            }
        }
    }, [instituteDetails]);

    const [allPackageSessionIds, setAllPackageSessionIds] = useState<string[]>([]);

    const [appliedFilters, setAppliedFilters] = useState<StudentFilterRequest>({
        name: '',
        institute_ids: INSTITUTE_ID ? [INSTITUTE_ID] : [],
        package_session_ids: allPackageSessionIds,
        group_ids: [],
        gender: [],
        statuses: instituteDetails?.student_statuses || [],
        session_expiry_days: [],
        sort_columns: {},
        sub_org_user_types: [],
        payment_statuses: [],
        sources: [],
        types: [],
        type_ids: [],
        destination_package_session_ids: [],
        level_ids: [],
    });

    useEffect(() => {
        const pksIds =
            columnFilters
                .find((filter) => filter.id === 'batch')
                ?.value.map((option) => option.id) ||
            (instituteDetails?.batches_for_sessions || [])
                .filter((batch) => batch.session.id === currentSession.id)
                .map((batch) => batch.id);

        setAllPackageSessionIds(pksIds);

        if (currentSession) {
            setAppliedFilters((prev) => ({
                ...prev,
                package_session_ids: pksIds,
            }));
        }
    }, [currentSession]);

    useEffect(() => {
        if (columnFilters.length === 0) {
            setClearFilters(false);
        }
    }, [columnFilters.length]);

    // Initialize filters from URL params
    useEffect(() => {
        if (!instituteDetails) return;
        
        // Prevent running this logic multiple times
        if (hasInitializedFilters.current) return;
        hasInitializedFilters.current = true;

        const initialFilters: { id: string; value: { id: string; label: string }[] }[] = [];

        // Session from URL - set current session if provided
        if (searchParams.session) {
            const session = getAllSessions().find((s) => s.id === searchParams.session);
            if (session) {
                const sessionItem = { id: session.id, name: session.session_name };
                setCurrentSession(sessionItem);
                setSelectedSession(session);
            }
        } else if (currentSession?.id) {
            // Set session in URL if not present
            const currentParams = new URLSearchParams(window.location.search);
            currentParams.set('session', currentSession.id);
            const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
            window.history.replaceState({}, '', newUrl);
        }

        // Role filter from URL
        if (searchParams.role) {
            const roles = Array.isArray(searchParams.role) ? searchParams.role : [searchParams.role];
            const roleOptions = roles.map((roleId) => ({
                id: roleId,
                label: roleId.replace(/_/g, ' '),
            }));
            if (roleOptions.length > 0) {
                initialFilters.push({ id: 'sub_org_user_types', value: roleOptions });
            }
        }

        // Gender filter from URL
        if (searchParams.gender) {
            const genders = Array.isArray(searchParams.gender) ? searchParams.gender : [searchParams.gender];
            // Deduplicate genders from URL
            const uniqueGenders = [...new Set(genders)];
            const genderOptions = uniqueGenders.map((gender) => ({
                id: gender,
                label: gender,
            }));
            if (genderOptions.length > 0) {
                initialFilters.push({ id: 'gender', value: genderOptions });
            }
        }

        // Status filter from URL
        if (searchParams.status) {
            const statuses = Array.isArray(searchParams.status) ? searchParams.status : [searchParams.status];
            // Deduplicate statuses from URL
            const uniqueStatuses = [...new Set(statuses)];
            const statusOptions = uniqueStatuses.map((status) => ({
                id: status,
                label: status,
            }));
            if (statusOptions.length > 0) {
                initialFilters.push({ id: 'statuses', value: statusOptions });
            }
        }

        // Batch filter from URL
        if (searchParams.batch) {
            const batches = Array.isArray(searchParams.batch) ? searchParams.batch : [searchParams.batch];
            const batchOptions = instituteDetails.batches_for_sessions
                ?.filter((batch) => batches.includes(batch.id))
                .map((batch) => ({
                    id: batch.id,
                    label: batch.package_dto?.package_name || batch.id,
                })) || [];
            if (batchOptions.length > 0) {
                initialFilters.push({ id: 'batch', value: batchOptions });
            }
        }

        // Session expiry filter from URL (using camelCase)
        if (searchParams.sessionExpiry) {
            const expiries = Array.isArray(searchParams.sessionExpiry) 
                ? searchParams.sessionExpiry 
                : [searchParams.sessionExpiry];
            const expiryOptions = expiries.map((days) => ({
                id: String(days),
                label: `${days} Days`,
            }));
            if (expiryOptions.length > 0) {
                initialFilters.push({ id: 'session_expiry_days', value: expiryOptions });
            }
        }

        // Name filter from URL
        if (searchParams.name) {
            setSearchInput(searchParams.name);
            setSearchFilter(searchParams.name);
        }
        
        // Custom field filters from URL
        if (instituteDetails?.dropdown_custom_fields) {
            instituteDetails.dropdown_custom_fields.forEach((customField) => {
                const urlValues = searchParams[customField.fieldKey];
                if (urlValues) {
                    const values = Array.isArray(urlValues) ? urlValues : [urlValues];
                    try {
                        const config = JSON.parse(customField.config);
                        const matchedOptions = values
                            .map((value) => {
                                const option = config.find((opt: any) => opt.value === value);
                                return option ? { id: option.value, label: option.label } : null;
                            })
                            .filter(Boolean) as { id: string; label: string }[];
                        
                        if (matchedOptions.length > 0) {
                            initialFilters.push({ id: customField.fieldKey, value: matchedOptions });
                        }
                    } catch (error) {
                        console.error(`Error parsing custom field ${customField.fieldName}:`, error);
                    }
                }
            });
        }

        if (initialFilters.length > 0) {
            setColumnFilters(initialFilters);
            // Mark that filters have been loaded from URL so they appear as "applied"
            // This ensures the UI shows them as active filters
            setClearFilters(false);
            
            // Apply the URL filters immediately on initial load
            // Calculate filters from initialFilters to apply them
            const statusFilter = initialFilters.find((filter) => filter.id === 'statuses');
            const statusesToApply = statusFilter?.value.map((option) => option.label) || [];
            const finalStatusesToApply = statusesToApply.length > 0 ? statusesToApply : instituteDetails?.student_statuses || [];

            const genderFilter = initialFilters.find((filter) => filter.id === 'gender');
            const gendersToApply = genderFilter?.value.map((option) => option.label) || [];

            const roleFilter = initialFilters.find((filter) => filter.id === 'sub_org_user_types');
            const rolesToApply = roleFilter?.value.map((option) => option.id) || [];

            const batchFilter = initialFilters.find((filter) => filter.id === 'batch');
            const pksids = batchFilter?.value.map((option) => option.id) || 
                (instituteDetails?.batches_for_sessions || [])
                    .filter((batch) => batch.session.id === currentSession.id)
                    .map((batch) => batch.id);

            const sessionExpiryFilter = initialFilters.find((filter) => filter.id === 'session_expiry_days');
            const sessionExpiryDays = sessionExpiryFilter?.value.map((value) => {
                const numberMatch = value.label.match(/\d+/);
                return numberMatch ? parseInt(numberMatch[0]) : 0;
            }) || [];

            // Handle custom field filters
            const customFieldParams: Record<string, any> = {};
            if (instituteDetails?.dropdown_custom_fields) {
                let index = 0;
                instituteDetails.dropdown_custom_fields.forEach((customField) => {
                    const filter = initialFilters.find((f) => f.id === customField.fieldKey);
                    if (filter && filter.value.length > 0) {
                        customFieldParams[`customFieldId${index}`] = customField.id;
                        customFieldParams[`customFieldValues${index}`] = filter.value.map((option) => option.id);
                        index++;
                    }
                });
            }

            setAppliedFilters((prev) => ({
                ...prev,
                name: searchFilter,
                package_session_ids: pksids,
                gender: gendersToApply,
                statuses: finalStatusesToApply,
                session_expiry_days: sessionExpiryDays,
                sub_org_user_types: rolesToApply,
                ...customFieldParams,
            }));
        }
    }, [instituteDetails, searchParams]);

    const handleSessionChange = (value: DropdownValueType) => {
        if (value && typeof value === 'object' && 'id' in value && 'name' in value) {
            setCurrentSession(value as DropdownItemType);
            const session = getAllSessions().find(
                (session) => session.id === (value as DropdownItemType).id
            );
            if (session) {
                setSelectedSession(session);
                // Update session in URL
                const currentParams = new URLSearchParams(window.location.search);
                currentParams.set('session', session.id);
                const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
                window.history.replaceState({}, '', newUrl);
            }
        }
    };

    const handleFilterChange = (filterId: string, options: { id: string; label: string }[]) => {
        setColumnFilters((prev) => {
            const existing = prev.filter((f) => f.id !== filterId);
            if (options.length === 0 && filterId === 'statuses') {
                // If clearing status filter, use all API-provided statuses
                return existing;
            }
            if (options.length === 0) return existing;
            return [...existing, { id: filterId, value: options }];
        });
    };

    const handleFilterClick = async () => {
        const sessionExpiryFilter = columnFilters.find(
            (filter) => filter.id === 'session_expiry_days'
        );
        const sessionExpiryDays = sessionExpiryFilter?.value.map((value) => {
            const numberMatch = value.label.match(/\d+/);
            return numberMatch ? parseInt(numberMatch[0]) : 0;
        });

        const statusFilter = columnFilters.find((filter) => filter.id === 'statuses');
        const statusesToApply = statusFilter?.value.map((option) => option.label) || [];
        const defaultStatuses = instituteDetails?.student_statuses || [];
        // If no status filter is selected, use all default statuses for API
        const finalStatusesToApply = statusesToApply.length > 0 ? statusesToApply : defaultStatuses;

        const pksids =
            columnFilters
                .find((filter) => filter.id === 'batch')
                ?.value.map((option) => option.id) || allPackageSessionIds;

        const roleFilter = columnFilters.find((filter) => filter.id === 'sub_org_user_types');
        const rolesToApply = roleFilter?.value.map((option) => option.id) || [];

        const genderFilter = columnFilters.find((filter) => filter.id === 'gender');
        const gendersToApply = genderFilter?.value.map((option) => option.label) || [];

        // Handle custom field filters - convert to flat structure
        const customFieldParams: Record<string, any> = {};
        if (instituteDetails?.dropdown_custom_fields) {
            let index = 0;
            instituteDetails.dropdown_custom_fields.forEach((customField) => {
                const filter = columnFilters.find((f) => f.id === customField.fieldKey);
                if (filter && filter.value.length > 0) {
                    customFieldParams[`customFieldId${index}`] = customField.id;
                    customFieldParams[`customFieldValues${index}`] = filter.value.map((option) => option.id);
                    index++;
                }
            });
        }

        // Build URL search params - preserve existing params and update only filter-related ones
        const currentParams = new URLSearchParams(window.location.search);
        
        // Remove old filter params to avoid duplicates
        currentParams.delete('name');
        currentParams.delete('role');
        currentParams.delete('gender');
        currentParams.delete('status');
        currentParams.delete('batch');
        currentParams.delete('sessionExpiry');
        
        // Remove old custom field params
        if (instituteDetails?.dropdown_custom_fields) {
            instituteDetails.dropdown_custom_fields.forEach((customField) => {
                currentParams.delete(customField.fieldKey);
            });
        }
        
        // Always include/update current session
        if (currentSession?.id) {
            currentParams.set('session', currentSession.id);
        }
        
        // Add new filter values
        if (searchFilter) {
            currentParams.set('name', searchFilter);
        }
        
        // Handle multiple roles - use unique values only
        if (rolesToApply.length > 0) {
            const uniqueRoles = [...new Set(rolesToApply)];
            uniqueRoles.forEach(role => currentParams.append('role', role));
        }
        
        // Handle multiple genders - use unique values only
        if (gendersToApply.length > 0) {
            const uniqueGenders = [...new Set(gendersToApply)];
            uniqueGenders.forEach(gender => currentParams.append('gender', gender));
        }
        
        // Handle multiple statuses - only add to URL if user has explicitly selected specific statuses
        // Don't add if no filter was selected (which means all statuses are applied by default)
        if (statusesToApply.length > 0) {
            const uniqueStatuses = [...new Set(statusesToApply)];
            uniqueStatuses.forEach(status => currentParams.append('status', status));
        }
        
        // Handle multiple batches - use unique values only
        if (pksids.length > 0 && pksids.length !== allPackageSessionIds.length) {
            const uniqueBatches = [...new Set(pksids)];
            uniqueBatches.forEach(batch => currentParams.append('batch', batch));
        }
        
        // Handle multiple session expiry values - use unique values only
        if (sessionExpiryDays && sessionExpiryDays.length > 0) {
            const uniqueDays = [...new Set(sessionExpiryDays)];
            uniqueDays.forEach(days => currentParams.append('sessionExpiry', String(days)));
        }
        
        // Handle custom field filters in URL - use unique values only
        if (instituteDetails?.dropdown_custom_fields) {
            instituteDetails.dropdown_custom_fields.forEach((customField) => {
                const filter = columnFilters.find((f) => f.id === customField.fieldKey);
                if (filter && filter.value.length > 0) {
                    const uniqueValues = [...new Set(filter.value.map(opt => opt.id))];
                    uniqueValues.forEach(value => {
                        currentParams.append(customField.fieldKey, value);
                    });
                }
            });
        }

        // Update URL preserving all other params (like courseId, etc.)
        const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
        window.history.replaceState({}, '', newUrl);

        setAppliedFilters((prev) => ({
            ...prev,
            name: searchFilter,
            package_session_ids: pksids,
            gender: gendersToApply,
            statuses: finalStatusesToApply,
            session_expiry_days: sessionExpiryDays || [],
            sub_org_user_types: rolesToApply,
            ...customFieldParams,
        }));
    };

    const handleClearFilters = async () => {
        setClearFilters(true);
        setColumnFilters([]);
        setSearchFilter('');
        setSearchInput('');

        const pksids = (instituteDetails?.batches_for_sessions || [])
            .filter((batch) => batch.session.id === currentSession.id)
            .map((batch) => batch.id);

        // Clear filter params but preserve other URL params (like courseId)
        const currentParams = new URLSearchParams(window.location.search);
        
        // Remove only filter-related params
        currentParams.delete('name');
        currentParams.delete('role');
        currentParams.delete('gender');
        currentParams.delete('status');
        currentParams.delete('batch');
        currentParams.delete('sessionExpiry');
        
        // Remove custom field params
        if (instituteDetails?.dropdown_custom_fields) {
            instituteDetails.dropdown_custom_fields.forEach((customField) => {
                currentParams.delete(customField.fieldKey);
            });
        }
        
        // Keep session
        if (currentSession?.id) {
            currentParams.set('session', currentSession.id);
        }
        
        const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
        window.history.replaceState({}, '', newUrl);

        // Remove all custom field params
        const newFilters: StudentFilterRequest = {
            name: '',
            package_session_ids: pksids,
            gender: [],
            statuses: instituteDetails?.student_statuses || [],
            session_expiry_days: [],
            sub_org_user_types: [],
            institute_ids: INSTITUTE_ID ? [INSTITUTE_ID] : [],
            group_ids: [],
            sort_columns: {},
        };

        setAppliedFilters(newFilters);
    };

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    };

    const handleSearchEnter = async () => {
        setSearchFilter(searchInput);
        
        // Update URL with search name
        const currentParams = new URLSearchParams(window.location.search);
        if (searchInput) {
            currentParams.set('name', searchInput);
        } else {
            currentParams.delete('name');
        }
        const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
        window.history.replaceState({}, '', newUrl);

        setAppliedFilters((prev) => ({
            ...prev,
            name: searchInput,
        }));
    };

    const handleClearSearch = async () => {
        setSearchInput('');
        setSearchFilter('');
        
        // Remove name from URL but keep session
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.delete('name');
        const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
        window.history.replaceState({}, '', newUrl);

        setAppliedFilters((prev) => ({
            ...prev,
            name: '',
        }));
    };

    const getActiveFiltersState = useCallback(() => {
        const batchFilter = columnFilters.find((filter) => filter.id === 'batch');
        const statusFilter = columnFilters.find((filter) => filter.id === 'statuses');
        const sessionExpiryFilter = columnFilters.find(
            (filter) => filter.id === 'session_expiry_days'
        );

        const hasBatch = Boolean(batchFilter?.value && batchFilter.value.length > 0);
        const hasName = Boolean(appliedFilters.name?.trim());
        const hasGender = Array.isArray(appliedFilters.gender) && appliedFilters.gender.length > 0;
        const hasStatus = Boolean(statusFilter?.value && statusFilter.value.length > 0);
        const hasSessionExpiry = Boolean(
            sessionExpiryFilter?.value && sessionExpiryFilter.value.length > 0
        );

        return Boolean(hasName || hasGender || hasStatus || hasBatch || hasSessionExpiry);
    }, [columnFilters, appliedFilters]);

    return {
        columnFilters,
        appliedFilters,
        clearFilters,
        searchInput,
        searchFilter,
        currentSession,
        sessionList,
        getActiveFiltersState,
        handleFilterChange,
        handleFilterClick,
        handleClearFilters,
        handleSearchInputChange,
        handleSearchEnter,
        handleClearSearch,
        setAppliedFilters,
        handleSessionChange,
        setColumnFilters,
    };
};

