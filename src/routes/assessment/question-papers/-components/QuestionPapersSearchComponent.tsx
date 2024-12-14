import { Input } from "@/components/ui/input";
import { MagnifyingGlass, XCircle } from "phosphor-react";
import { useState } from "react";

export const QuestionPapersSearchComponent = () => {
    const [searchText, setSearchText] = useState("");

    const clearSearch = () => {
        setSearchText("");
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            console.log(searchText);
        }
    };

    return (
        <div className="relative">
            <MagnifyingGlass className="absolute left-2 top-1/2 -translate-y-1/2 transform cursor-pointer text-neutral-600" />
            <Input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Search Question Paper"
                className="pl-8 pr-12"
            />
            {searchText && (
                <XCircle
                    className="absolute right-2 top-1/2 -translate-y-1/2 transform cursor-pointer text-neutral-600"
                    onClick={clearSearch}
                />
            )}
        </div>
    );
};
