// components/StudentSearchBox.tsx
import { MyInput } from '@/components/design-system/input';
import { MagnifyingGlass, KeyReturn, XCircle, CaretRight } from '@phosphor-icons/react';
import { StudentSearchBoxProps, AutocompletePackage } from '@/routes/manage-students/students-list/-types/students-list-types';

import { useCompactMode } from '@/hooks/use-compact-mode';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { PACKAGE_AUTOCOMPLETE_URL } from '@/constants/urls';

export const StudentSearchBox = ({
    searchInput,
    searchFilter,
    onSearchChange,
    onSearchEnter,
    onClearSearch,
    placeholder,
    sessionId,
    instituteId,
    selectedPackages,
    onPackageRemove,
    onPackageSelect
}: StudentSearchBoxProps) => {
    const { isCompact } = useCompactMode();
    const [suggestions, setSuggestions] = useState<AutocompletePackage[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Debounce search for autocomplete
    useEffect(() => {
        const fetchSuggestions = async () => {
            // Only fetch if we have input, instituteId, and it's not just the search icon trigger
            if (!searchInput || searchInput.length < 1  || !instituteId) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            setLoading(true);
            try {
                const response = await authenticatedAxiosInstance.get(PACKAGE_AUTOCOMPLETE_URL, {
                    params: {
                        q: searchInput,
                        instituteId: instituteId,
                        session_id: sessionId || undefined,
                    },
                });

                const data = response.data;
                let normalizedResults: AutocompletePackage[] = [];

                if (data) {
                    if (Array.isArray(data.suggestions)) {
                        normalizedResults = data.suggestions;
                    } else if (Array.isArray(data.content)) {
                        normalizedResults = data.content.map((pkg: any) => ({
                            package_name: pkg.package_name,
                            package_id: pkg.id || pkg.package_id,
                            course_name: pkg.course_name,
                            package_session_id: pkg.package_session_id || pkg.id, // Fallback if needed
                            level_name: pkg.level_name
                        }));
                    } else if (Array.isArray(data)) {
                        normalizedResults = data;
                    }
                }

                setSuggestions(normalizedResults);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [searchInput, instituteId, sessionId]);

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectSuggestion = (pkg: AutocompletePackage) => {
        // Clear input text to allow searching for next item
        const event = {
            target: {
                value: ''
            }
        } as React.ChangeEvent<HTMLInputElement>;

        onSearchChange(event);
        setShowSuggestions(false);

        // Trigger selection logic
        if (onPackageSelect) {
            onPackageSelect(pkg);
        }
    };

    return (
        <div className="relative flex flex-col gap-2" ref={wrapperRef}>
            {/* Selected Packages Chips */}
            {selectedPackages && selectedPackages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedPackages.map((pkg) => (
                        <div
                            key={pkg.package_session_id || pkg.package_id}
                            className="flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 border border-primary-100"
                        >
                            <span>{pkg.package_name}</span>
                            {pkg.level_name && <span className="text-primary-500 text-[10px]">({pkg.level_name})</span>}
                            <button
                                onClick={() => onPackageRemove?.(pkg.package_session_id || pkg.package_id)}
                                className="ml-1 rounded-full p-0.5 hover:bg-primary-100 text-primary-500"
                            >
                                <XCircle size={14} weight="fill" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="relative w-full">
                <MyInput
                    inputType="text"
                    input={searchInput}
                    onChangeFunction={onSearchChange}
                    inputPlaceholder={placeholder || "Search by name, enroll..."}
                    className={cn("px-9 w-full", isCompact ? "h-8 text-xs placeholder:text-xs" : "")}
                    onFocus={() => {
                        if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                />
                <MagnifyingGlass className={cn("absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600", isCompact ? "size-3.5" : "size-[18px]")} />

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <KeyReturn
                        weight="fill"
                        className={cn(
                            "cursor-pointer text-primary-500 transition-opacity duration-200",
                            isCompact ? "size-3.5" : "size-[18px]",
                            (searchInput.length || (searchFilter.length && !searchInput.length)) && searchFilter != searchInput
                                ? 'opacity-100 visible'
                                : 'opacity-0 invisible'
                        )}
                        onClick={() => {
                            setShowSuggestions(false);
                            onSearchEnter();
                        }}
                    />
                    <XCircle
                        className={cn(
                            "cursor-pointer text-neutral-400 transition-opacity duration-200",
                            isCompact ? "size-3.5" : "size-[18px]",
                            searchInput == searchFilter && searchInput != ''
                                ? 'opacity-100 visible'
                                : 'opacity-0 invisible'
                        )}
                        onClick={() => {
                            setSuggestions([]);
                            setShowSuggestions(false);
                            onClearSearch();
                        }}
                    />
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && (
                    <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
                        {suggestions.length > 0 ? (
                            <ul className="max-h-60 overflow-y-auto py-1">
                                {suggestions.map((pkg, index) => (
                                    <li key={index}>
                                        <button
                                            type="button"
                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 focus:bg-neutral-50 focus:outline-none"
                                            onClick={() => handleSelectSuggestion(pkg)}
                                        >
                                            <MagnifyingGlass className="size-4 min-w-4 text-neutral-400" />
                                            <div className="flex flex-1 flex-col">
                                                <span className="font-medium text-neutral-800">{pkg.package_name}</span>
                                                {pkg.level_name && (
                                                    <span className="text-xs text-neutral-500 mt-0.5">{pkg.level_name}</span>
                                                )}
                                            </div>
                                            <CaretRight className="size-3 text-neutral-300" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center px-4 py-6 text-center text-sm text-neutral-500">
                                <p>No results found for "{searchInput}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
