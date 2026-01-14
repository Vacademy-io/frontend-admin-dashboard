import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import SelectChips, { SelectOption } from './SelectChips';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { cn } from '@/lib/utils';
import { MagnifyingGlass, X, CaretRight, Info } from '@phosphor-icons/react';
import { PACKAGE_AUTOCOMPLETE_URL } from '@/constants/urls';

interface PackageSelectorProps {
    instituteId: string;
    onChange: (selection: {
        packageSessionId: string | null;
        levelId: string;
        sessionId: string;
        packageId: string;
    }) => void;
    className?: string;
    initialLevelId?: string;
    initialSessionId?: string;
    initialPackageId?: string;
}

interface AutocompletePackage {
    id: string; // Internal ID used in component
    package_name: string;
    package_id?: string; // Original field from API
    package_session_id?: string; // Field from API
}

const PackageSelector: React.FC<PackageSelectorProps> = ({
    instituteId,
    onChange,
    className,
    initialLevelId = '',
    initialSessionId = '',
    initialPackageId = '',
}) => {
    const {
        getAllLevels,
        getAllSessions,
        getPackageSessionId,
        instituteDetails
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

    // Unified state synchronization and search term initialization
    useEffect(() => {
        setLevelId(initialLevelId);
        setSessionId(initialSessionId);
        setPackageId(initialPackageId);

        if (initialPackageId) {
            // Find package name from store if packageId is set
            if (instituteDetails) {
                const batch = instituteDetails.batches_for_sessions.find(b => b.package_dto.id === initialPackageId);
                if (batch) {
                    setSearchTerm(batch.package_dto.package_name);
                }
            }
        } else {
            setSearchTerm('');
            setSearchResults([]);
        }
    }, [initialLevelId, initialSessionId, initialPackageId, instituteDetails]);

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

    const levelOptions: SelectOption[] = useMemo(() =>
        levels.map(l => ({ label: l.level_name, value: l.id })),
        [levels]);

    const sessionOptions: SelectOption[] = useMemo(() =>
        sessions.map(s => ({ label: s.session_name, value: s.id })),
        [sessions]);

    // Handle Level Change
    const handleLevelChange = (selected: SelectOption[]) => {
        const value = selected[0]?.value || '';
        setLevelId(value);
        setSessionId(''); // Reset downstream
        setPackageId('');
        setSearchTerm('');
        setSearchResults([]);
        onChange({ packageSessionId: null, levelId: value, sessionId: '', packageId: '' });
    };

    // Handle Session Change
    const handleSessionChange = (selected: SelectOption[]) => {
        const value = selected[0]?.value || '';
        setSessionId(value);
        setPackageId(''); // Reset downstream
        setSearchTerm('');
        setSearchResults([]);
        onChange({ packageSessionId: null, levelId, sessionId: value, packageId: '' });
    };

    // Fetch autocomplete results
    useEffect(() => {
        const fetchPackages = async () => {
            // We still need level and session, but allow empty debouncedSearchTerm 
            // to support "dropdown" behavior if the API allows it.
            if (!levelId || !sessionId) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const response = await authenticatedAxiosInstance.get(PACKAGE_AUTOCOMPLETE_URL, {
                    params: {
                        q: debouncedSearchTerm || '',
                        instituteId: instituteId,
                        session_id: sessionId,
                        level_id: levelId
                    }
                });

                const data = response.data;
                let normalizedResults: AutocompletePackage[] = [];

                if (Array.isArray(data)) {
                    normalizedResults = data.map(pkg => ({
                        ...pkg,
                        id: pkg.id || pkg.package_id || ''
                    }));
                } else if (data && Array.isArray(data.suggestions)) {
                    normalizedResults = data.suggestions.map((pkg: any) => ({
                        id: pkg.package_id || '',
                        package_name: pkg.package_name || '',
                        package_id: pkg.package_id,
                        package_session_id: pkg.package_session_id
                    }));
                } else if (data && Array.isArray(data.content)) {
                    normalizedResults = data.content.map((pkg: any) => ({
                        ...pkg,
                        id: pkg.id || pkg.package_id || ''
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
        setPackageId(pkg.id);
        setSearchTerm(pkg.package_name);
        setShowResults(false);

        // Prioritize package_session_id from API if available
        let psId = pkg.package_session_id;

        if (!psId) {
            // Fallback to store if not in API response
            psId = getPackageSessionId({
                courseId: pkg.id,
                levelId: levelId,
                sessionId: sessionId
            }) || undefined;
        }

        onChange({
            packageSessionId: psId || null,
            levelId,
            sessionId,
            packageId: pkg.id
        });
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showResults || searchResults.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
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
        setPackageId('');
        setSearchResults([]);
        onChange({ packageSessionId: null, levelId, sessionId, packageId: '' });
    };

    return (
        <div className={cn("space-y-4", className)} ref={containerRef}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* 1. Level Selector */}
                <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                        1. Select Level
                    </Label>
                    <SelectChips
                        options={levelOptions}
                        selected={levelOptions.filter(o => o.value === levelId)}
                        onChange={handleLevelChange}
                        placeholder="Choose Level"
                        multiSelect={false}
                        className="w-full"
                    />
                </div>

                {/* 2. Session Selector (Enabled only if Level selected) */}
                <div className="space-y-2">
                    <Label className={cn(
                        "text-xs font-medium uppercase tracking-wider",
                        !levelId ? "text-gray-400" : "text-gray-700"
                    )}>
                        2. Select Session
                    </Label>
                    <SelectChips
                        options={sessionOptions}
                        selected={sessionOptions.filter(o => o.value === sessionId)}
                        onChange={handleSessionChange}
                        placeholder="Choose Session"
                        multiSelect={false}
                        disabled={!levelId}
                        className="w-full"
                    />
                </div>

                {/* 3. Package Autocomplete (Enabled only if Level & Session selected) */}
                <div className="relative space-y-2">
                    <Label className={cn(
                        "text-xs font-medium uppercase tracking-wider",
                        (!levelId || !sessionId) ? "text-gray-400" : "text-gray-700"
                    )}>
                        3. Search Package
                    </Label>
                    <div className="relative group">
                        <Input
                            placeholder="Type to search packages..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowResults(true);
                            }}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setShowResults(true)}
                            disabled={!levelId || !sessionId}
                            className={cn(
                                "pl-10 pr-10 text-sm transition-all duration-200 focus-visible:ring-1 focus-visible:ring-ring",
                                showResults && searchResults.length > 0 && "rounded-b-none"
                            )}
                        />
                        <MagnifyingGlass className={cn(
                            "absolute left-3 top-1/2 size-4 -translate-y-1/2 transition-colors",
                            (!levelId || !sessionId) ? "text-gray-300" : "text-gray-400"
                        )} />

                        {searchTerm && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
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
                    {showResults && (isSearching || searchResults.length > 0) && (
                        <div className="absolute z-50 w-full rounded-b-md border border-t-0 border-gray-200 bg-white shadow-xl overflow-hidden max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                            {isSearching && searchResults.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                                    <div className="size-3 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                                    Loading packages...
                                </div>
                            ) : (
                                Array.isArray(searchResults) &&
                                searchResults.map((pkg, index) => (
                                    <button
                                        key={pkg.id}
                                        type="button"
                                        onClick={() => handlePackageSelect(pkg)}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        className={cn(
                                            "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                                            selectedIndex === index
                                                ? "bg-gray-100 text-gray-900 font-medium"
                                                : "bg-white text-gray-700"
                                        )}
                                    >
                                        <MagnifyingGlass className={cn(
                                            "size-3.5",
                                            selectedIndex === index ? "text-gray-600" : "text-gray-400"
                                        )} weight={selectedIndex === index ? "bold" : "regular"} />
                                        <span className="flex-1 text-sm truncate">{pkg.package_name}</span>
                                        {selectedIndex === index && <CaretRight size={14} className="text-gray-400" />}
                                    </button>
                                ))
                            )}
                        </div>
                    )}

                    {showResults && searchTerm && searchResults.length === 0 && !isSearching && (
                        <div className="absolute z-50 w-full rounded-b-md border border-t-0 border-gray-200 bg-white p-6 shadow-xl text-center animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="mx-auto size-10 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                <MagnifyingGlass className="size-5 text-gray-300" />
                            </div>
                            <p className="text-sm font-medium text-gray-900">No matching packages</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Hint message if not fully selected */}
            {(!levelId || !sessionId) && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/50 border border-blue-100/50">
                    <div className="mt-0.5 size-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Info className="size-2.5 text-blue-600 fill-blue-600" />
                    </div>
                    <p className="text-xs text-blue-700 leading-relaxed font-normal">
                        Select a <span className="font-bold">Level</span> and <span className="font-bold">Session</span> above to browse and search for specific course packages.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PackageSelector;
