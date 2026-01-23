import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { useBatchesByIds } from '@/services/paginated-batches';
import SelectChips, { SelectOption } from './SelectChips';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { cn } from '@/lib/utils';
import { MagnifyingGlass, X, CaretRight, Info } from '@phosphor-icons/react';
import { PACKAGE_AUTOCOMPLETE_URL } from '@/constants/urls';
import { BatchForSession } from '@/types/payment-logs';

interface PackageSelectorProps {
    instituteId: string;
    onChange: (selection: {
        packageSessionId: string | null;
        levelId: string;
        sessionId: string;
        packageId: string;
        packageSessionIds?: string[]; // Added for multi-select
    }) => void;
    multiSelect?: boolean;
    initialPackageSessionIds?: string[];
    className?: string;
    initialLevelId?: string;
    initialSessionId?: string;
    initialPackageId?: string;
    batchesForSessions?: BatchForSession[];
}

interface AutocompletePackage {
    id: string; // Internal ID used in component
    package_name: string;
    package_id?: string; // Original field from API
    package_session_id?: string; // Field from API
    level_id?: string;
    level_name?: string;
    session_id?: string;
    session_name?: string;
}

const PackageSelector: React.FC<PackageSelectorProps> = ({
    instituteId,
    onChange,
    multiSelect = false,
    initialPackageSessionIds = [],
    className,
    initialLevelId = '',
    initialSessionId = '',
    initialPackageId = '',
    // batchesForSessions is deprecated - component now uses useBatchesByIds internally
}) => {
    const {
        getAllLevels,
        getAllSessions,
        getPackageSessionId,
        getLevelsFromPackage,
        getSessionFromPackage,
        getDetailsFromPackageSessionId,
    } = useInstituteDetailsStore();

    const [levelId, setLevelId] = useState<string>(initialLevelId);
    const [sessionId, setSessionId] = useState<string>(initialSessionId);
    const [packageId, setPackageId] = useState<string>(initialPackageId);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchResults, setSearchResults] = useState<AutocompletePackage[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [showResults, setShowResults] = useState<boolean>(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const containerRef = useRef<HTMLDivElement>(null);

    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
    const [selectedPackages, setSelectedPackages] = useState<AutocompletePackage[]>([]);

    // Prepare IDs for fetching batch details
    const idsToFetch = useMemo(() => {
        const ids: string[] = [];
        if (multiSelect && initialPackageSessionIds && initialPackageSessionIds.length > 0) {
            ids.push(...initialPackageSessionIds);
        }
        return ids;
    }, [multiSelect, initialPackageSessionIds]);

    // Fetch batch details for initial package session IDs
    const { data: batchDetailsData } = useBatchesByIds(idsToFetch, undefined, {
        enabled: idsToFetch.length > 0,
    });

    // Load initial packages from fetched batch details
    useEffect(() => {
        if (
            multiSelect &&
            initialPackageSessionIds &&
            initialPackageSessionIds.length > 0 &&
            batchDetailsData?.content
        ) {
            const initialPkgs: AutocompletePackage[] = [];
            initialPackageSessionIds.forEach((id) => {
                const batch = batchDetailsData.content.find((b) => b.id === id);
                if (batch) {
                    initialPkgs.push({
                        id: batch.package_dto.id,
                        package_name: batch.package_dto.package_name,
                        package_id: batch.package_dto.id,
                        package_session_id: batch.id,
                    });
                }
            });
            if (initialPkgs.length > 0) {
                setSelectedPackages(initialPkgs);
            }
        }
    }, [initialPackageSessionIds, batchDetailsData, multiSelect]);

    // Unified state synchronization and search term initialization
    useEffect(() => {
        setLevelId(initialLevelId);
        setSessionId(initialSessionId);
        setPackageId(initialPackageId);

        if (initialPackageId) {
            // Find package name using getDetailsFromPackageSessionId or search results
            // First try to get from existing search results
            const foundPkg = searchResults.find(
                (pkg) => pkg.id === initialPackageId || pkg.package_id === initialPackageId
            );
            if (foundPkg) {
                setSearchTerm(foundPkg.package_name);
            } else {
                // Try to get from store's getDetailsFromPackageSessionId
                // Note: This may not work directly with packageId, fallback to empty
                const details = getDetailsFromPackageSessionId({
                    packageSessionId: initialPackageId,
                });
                if (details?.package_dto?.package_name) {
                    setSearchTerm(details.package_dto.package_name);
                }
            }
        } else if (!multiSelect) {
            setSearchTerm('');
            setSearchResults([]);
        }
    }, [
        initialLevelId,
        initialSessionId,
        initialPackageId,
        getDetailsFromPackageSessionId,
        multiSelect,
        searchResults,
    ]);

    // Internal debouncing logic
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    // Reset selected index when results change
    useEffect(() => {
        setSelectedIndex(-1);
    }, [searchResults]);

    // Click outside logic
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Get options from store
    const levels = getAllLevels();
    const sessions = getAllSessions();

    const filteredLevels = useMemo(() => {
        if (packageId) {
            const packageLevels = getLevelsFromPackage({ courseId: packageId });
            return levels.filter((l) => packageLevels.some((pl) => pl.id === l.id));
        }
        return levels;
    }, [levels, packageId, getLevelsFromPackage]);

    const filteredSessions = useMemo(() => {
        if (packageId || levelId) {
            const packageSessions = getSessionFromPackage({
                courseId: packageId || undefined,
                levelId: levelId || undefined,
            });
            return sessions.filter((s) => packageSessions.some((ps) => ps.id === s.id));
        }
        return sessions;
    }, [sessions, packageId, levelId, getSessionFromPackage]);

    const levelOptions: SelectOption[] = useMemo(
        () => filteredLevels.map((l) => ({ label: l.level_name, value: l.id })),
        [filteredLevels]
    );

    const sessionOptions: SelectOption[] = useMemo(
        () => filteredSessions.map((s) => ({ label: s.session_name, value: s.id })),
        [filteredSessions]
    );

    // Handle Level Change
    const handleLevelChange = (selected: SelectOption[]) => {
        const value = selected[0]?.value || '';
        setLevelId(value);
        setSessionId(''); // Reset downstream

        const psId =
            packageId && value
                ? getPackageSessionId({
                      courseId: packageId,
                      levelId: value,
                      sessionId: '',
                  })
                : null;

        if (multiSelect && psId) {
            handlePackageSelect({
                id: packageId,
                package_name: searchTerm,
                package_id: packageId,
                package_session_id: psId,
            });
            return;
        }

        onChange({
            packageSessionId: psId,
            levelId: value,
            sessionId: '',
            packageId: packageId,
            packageSessionIds: multiSelect
                ? selectedPackages.map((p) => p.package_session_id!).filter(Boolean)
                : [],
        });
    };

    // Handle Session Change
    const handleSessionChange = (selected: SelectOption[]) => {
        const value = selected[0]?.value || '';
        setSessionId(value);

        const psId =
            packageId && levelId && value
                ? getPackageSessionId({
                      courseId: packageId,
                      levelId: levelId,
                      sessionId: value,
                  })
                : null;

        if (multiSelect && psId) {
            handlePackageSelect({
                id: packageId,
                package_name: searchTerm,
                package_id: packageId,
                package_session_id: psId,
            });
            return;
        }

        onChange({
            packageSessionId: psId,
            levelId,
            sessionId: value,
            packageId: packageId,
            packageSessionIds: multiSelect
                ? selectedPackages.map((p) => p.package_session_id!).filter(Boolean)
                : [],
        });
    };

    // Fetch autocomplete results
    useEffect(() => {
        const fetchPackages = async () => {
            // Package search is now the entry point, so we don't strictly need level/session
            // But we pass them if they are selected to narrow down results if needed by API
            setIsSearching(true);
            try {
                const response = await authenticatedAxiosInstance.get(PACKAGE_AUTOCOMPLETE_URL, {
                    params: {
                        q: debouncedSearchTerm || '',
                        instituteId: instituteId,
                        session_id: sessionId || undefined,
                        level_id: levelId || undefined,
                    },
                });

                const data = response.data;
                let normalizedResults: AutocompletePackage[] = [];

                if (Array.isArray(data)) {
                    normalizedResults = data.map((pkg) => ({
                        ...pkg,
                        id: pkg.id || pkg.package_id || '',
                    }));
                } else if (data && Array.isArray(data.suggestions)) {
                    normalizedResults = data.suggestions.map((pkg: any) => ({
                        id: pkg.package_id || '',
                        package_name: pkg.package_name || '',
                        package_id: pkg.package_id,
                        package_session_id: pkg.package_session_id,
                        level_id: pkg.level_id,
                        level_name: pkg.level_name,
                        session_id: pkg.session_id,
                        session_name: pkg.session_name,
                    }));
                } else if (data && Array.isArray(data.content)) {
                    normalizedResults = data.content.map((pkg: any) => ({
                        ...pkg,
                        id: pkg.id || pkg.package_id || '',
                        level_id: pkg.level_id,
                        level_name: pkg.level_name,
                        session_id: pkg.session_id,
                        session_name: pkg.session_name,
                    }));
                }

                setSearchResults(normalizedResults);
            } catch (error) {
                console.error('Error fetching packages:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        fetchPackages();
    }, [debouncedSearchTerm, levelId, sessionId, instituteId]);

    // Handle Package Selection
    const handlePackageSelect = (pkg: AutocompletePackage) => {
        // Prioritize package_session_id from API if available
        let psId = pkg.package_session_id;

        if (!psId) {
            // Fallback to store if not in API response
            psId =
                getPackageSessionId({
                    courseId: pkg.id || pkg.package_id || '',
                    levelId: levelId,
                    sessionId: sessionId,
                }) || undefined;
        }

        if (multiSelect) {
            if (psId) {
                // If we have a psId, add it to selected list
                if (!selectedPackages.find((p) => p.package_session_id === psId)) {
                    const newSelection = [
                        ...selectedPackages,
                        { ...pkg, package_session_id: psId },
                    ];
                    setSelectedPackages(newSelection);

                    setShowResults(false);

                    if (pkg.level_id) setLevelId(pkg.level_id);
                    if (pkg.session_id) setSessionId(pkg.session_id);

                    onChange({
                        packageSessionId: psId,
                        levelId: pkg.level_id || levelId,
                        sessionId: pkg.session_id || sessionId,
                        packageId: pkg.id || pkg.package_id || '',
                        packageSessionIds: newSelection
                            .map((p) => p.package_session_id!)
                            .filter(Boolean),
                    });
                } else {
                    setShowResults(false);
                }
            } else {
                // No psId yet, set packageId so user can select level/session
                setPackageId(pkg.id || pkg.package_id || '');
                // Note: We don't set search term here because the user might be typing
                setShowResults(false);

                onChange({
                    packageSessionId: null,
                    levelId,
                    sessionId,
                    packageId: pkg.id || pkg.package_id || '',
                    packageSessionIds: selectedPackages
                        .map((p) => p.package_session_id!)
                        .filter(Boolean),
                });
            }
        } else {
            if (pkg.level_id) setLevelId(pkg.level_id);
            if (pkg.session_id) setSessionId(pkg.session_id);
            setPackageId(pkg.id || pkg.package_id || '');
            setSearchTerm(pkg.package_name);
            setShowResults(false);

            onChange({
                packageSessionId: psId || null,
                levelId: pkg.level_id || levelId,
                sessionId: pkg.session_id || sessionId,
                packageId: pkg.id || pkg.package_id || '',
            });
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showResults || searchResults.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const selectedPackage = searchResults[selectedIndex];
            if (selectedPackage) {
                handlePackageSelect(selectedPackage);
            }
        } else if (e.key === 'Escape') {
            setShowResults(false);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setSearchResults([]);
        setPackageId('');
        if (!multiSelect) {
            onChange({ packageSessionId: null, levelId, sessionId, packageId: '' });
        }
    };

    return (
        <div className={cn('space-y-4', className)} ref={containerRef}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* 1. Package Autocomplete (First entry point) */}
                <div className="relative space-y-2">
                    <Label className="text-xs font-medium uppercase tracking-wider text-gray-700">
                        1. Search Package
                    </Label>
                    <div className="group relative">
                        <Input
                            placeholder="Type to search packages..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowResults(true);
                            }}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setShowResults(true)}
                            className={cn(
                                'pl-10 pr-10 text-sm transition-all duration-200 focus-visible:ring-1 focus-visible:ring-ring',
                                showResults && searchResults.length > 0
                                    ? 'rounded-b-none'
                                    : 'rounded-md'
                            )}
                        />
                        <MagnifyingGlass className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 transition-colors" />

                        {searchTerm && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}

                        {isSearching && (
                            <div className="absolute right-10 top-1/2 -translate-y-1/2">
                                <div className="size-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
                            </div>
                        )}
                    </div>

                    {/* Autocomplete Results Dropdown */}
                    {showResults &&
                        (isSearching ||
                            (Array.isArray(searchResults) && searchResults.length > 0)) && (
                            <div className="absolute z-50 max-h-[400px] w-full overflow-hidden overflow-y-auto rounded-b-md border border-t-0 border-gray-200 bg-white shadow-xl duration-150 animate-in fade-in slide-in-from-top-1">
                                {isSearching && searchResults.length === 0 ? (
                                    <div className="flex items-center justify-center gap-2 p-4 text-center text-sm text-gray-500">
                                        <div className="size-3 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                                        Loading packages...
                                    </div>
                                ) : (
                                    Array.isArray(searchResults) &&
                                    searchResults.map((pkg, index) => (
                                        <button
                                            key={pkg.id || pkg.package_id}
                                            type="button"
                                            onClick={() => handlePackageSelect(pkg)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={cn(
                                                'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                                                selectedIndex === index
                                                    ? 'bg-gray-100 font-medium text-gray-900'
                                                    : 'bg-white text-gray-700'
                                            )}
                                        >
                                            <MagnifyingGlass
                                                className={cn(
                                                    'size-3.5',
                                                    selectedIndex === index
                                                        ? 'text-gray-600'
                                                        : 'text-gray-400'
                                                )}
                                                weight={
                                                    selectedIndex === index ? 'bold' : 'regular'
                                                }
                                            />
                                            <div className="flex flex-1 flex-col truncate">
                                                <span className="text-sm font-medium">
                                                    {pkg.package_name}
                                                </span>
                                                {(pkg.level_name || pkg.session_name) && (
                                                    <div className="mt-0.5 flex items-center gap-2">
                                                        {pkg.level_name && (
                                                            <span className="rounded border border-transparent bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-500">
                                                                {pkg.level_name}
                                                            </span>
                                                        )}
                                                        {pkg.session_name && (
                                                            <span className="rounded border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-blue-600">
                                                                {pkg.session_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {selectedIndex === index && (
                                                <CaretRight size={14} className="text-gray-400" />
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                    {showResults && searchTerm && searchResults.length === 0 && !isSearching && (
                        <div className="absolute z-50 w-full rounded-b-md border border-t-0 border-gray-200 bg-white p-6 text-center shadow-xl duration-200 animate-in fade-in slide-in-from-top-1">
                            <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-gray-50">
                                <MagnifyingGlass className="size-5 text-gray-300" />
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                                No result found for "{searchTerm}"
                            </p>
                        </div>
                    )}
                </div>

                {/* 2. Level Selector */}
                <div className="space-y-2">
                    <Label className="text-xs font-medium uppercase tracking-wider text-gray-700">
                        2. Select Level
                    </Label>
                    <SelectChips
                        options={levelOptions}
                        selected={levelOptions.filter((o) => o.value === levelId)}
                        onChange={handleLevelChange}
                        placeholder="Choose Level"
                        multiSelect={false}
                        className="w-full"
                    />
                </div>

                {/* 3. Session Selector */}
                <div className="space-y-2">
                    <Label className="text-xs font-medium uppercase tracking-wider text-gray-700">
                        3. Select Session
                    </Label>
                    <SelectChips
                        options={sessionOptions}
                        selected={sessionOptions.filter((o) => o.value === sessionId)}
                        onChange={handleSessionChange}
                        placeholder="Choose Session"
                        multiSelect={false}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Hint message if not fully selected */}
            {!packageId && selectedPackages.length === 0 && (
                <div className="flex items-start gap-2.5 rounded-lg border border-blue-100/50 bg-blue-50/50 p-3">
                    <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-blue-100">
                        <Info className="size-2.5 fill-blue-600 text-blue-600" />
                    </div>
                    <p className="text-xs font-normal leading-relaxed text-blue-700">
                        Start by searching for a <span className="font-bold">Package</span> to
                        filter by level and session.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PackageSelector;
