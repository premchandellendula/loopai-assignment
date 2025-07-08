import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface Option {
    label: string;
    value: string | number;
}

export type Filters = Record<string, Option[]>;

type FiltersUpdater = Filters | ((prev: Filters) => Filters);

interface FilterContextType {
    useLargeData: boolean;
    setUseLargeData: (val: boolean) => void;
    selectedFilters: Filters;
    setSelectedFilters: (filters: FiltersUpdater) => void;
    resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

const LOCAL_STORAGE_KEY = 'dashboardBookmark';

const loadBookmark = (): { useLargeData: boolean; selectedFilters: Filters } => {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!raw) return { useLargeData: false, selectedFilters: {} };
        const parsed = JSON.parse(raw);
        return {
            useLargeData: parsed.useLargeData ?? false,
            selectedFilters: parsed.selectedFilters ?? {},
        };
    } catch {
        return { useLargeData: false, selectedFilters: {} };
    }
};

const defaultFilters: Filters = {};

export const FilterProvider = ({children}: { children: ReactNode }) => {
    const initial = loadBookmark();
    const [useLargeData, setUseLargeData] = useState<boolean>(initial.useLargeData);
    const [selectedFilters, setSelectedFilters] = useState<Filters>(initial.selectedFilters);

    useEffect(() => {
        const toStore = JSON.stringify({ useLargeData, selectedFilters });
        localStorage.setItem(LOCAL_STORAGE_KEY, toStore);
    }, [useLargeData, selectedFilters]);
    
    const resetFilters = () => setSelectedFilters(defaultFilters);

    return (
        <FilterContext.Provider value={{ useLargeData, setUseLargeData, selectedFilters, setSelectedFilters, resetFilters }}>
            {children}
        </FilterContext.Provider>
    )
}

export const useFilterContext = (): FilterContextType => {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error('useFilterContext must be used within FilterProvider');
    }
    return context;
};