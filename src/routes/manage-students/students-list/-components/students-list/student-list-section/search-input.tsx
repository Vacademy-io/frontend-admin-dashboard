import { MagnifyingGlass } from '@phosphor-icons/react';
import { MyInput } from '../../../../../../components/design-system/input';

interface SearchInputProps {
    searchInput: string;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
}

export const SearchInput = ({ searchInput, onSearchChange, placeholder }: SearchInputProps) => {
    return (
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition duration-300"></div>
            <div className="relative">
                <MyInput
                    inputType="text"
                    input={searchInput}
                    onChangeFunction={onSearchChange}
                    inputPlaceholder={placeholder}
                    className="pl-10 pr-4 bg-gradient-to-r from-white to-neutral-50/50 border-neutral-200/50 focus:border-primary-300 hover:border-neutral-300 transition-all duration-200"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-200 group-focus-within:text-primary-500">
                    <MagnifyingGlass className="size-4 text-neutral-500 group-focus-within:text-primary-500 group-focus-within:scale-110 transition-all duration-200" />
                </div>
                {searchInput && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                    </div>
                )}
            </div>
        </div>
    );
};
