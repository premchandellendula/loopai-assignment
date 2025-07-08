import React, { useMemo } from 'react'
import DataTable from 'react-data-table-component';
import Select from 'react-select';
import { useFilterContext } from '../other/FilterContext';

export interface RowData {
    [key: string]: number
}

interface Option {
    label: string;
    value: number;
}

interface Props {
    data: RowData[];
}

const FilterableTable: React.FC<Props> = ({data}) => {
    const { selectedFilters, setSelectedFilters } = useFilterContext()

    const filterColumns = useMemo(() => {
        if (data.length === 0) return [];
        return Object.keys(data[0]).filter((key) => key !== 'number');
    }, [data]);

    const getFilteredOptions = (targetField: string): Option[] => {
        const rows = data.filter((row) => {
            return filterColumns.every((col) => {
                if (col === targetField) return true;
                const selected = selectedFilters[col];
                if (!selected || selected.length === 0) return true;
                return selected.some(opt => opt.value === row[col]);
            });
        });
    
        const values = Array.from(new Set(rows.map((row) => row[targetField])));
        return values.map((v) => ({ label: v.toString(), value: v }));
    };

    const handleFilterChange = (field: string, selected: Option[] | null) => {
        setSelectedFilters({
            ...selectedFilters,
            [field]: selected ?? [],
        });
    };
    
    const filteredData = useMemo(() => {
        return data.filter((row) => {
            return filterColumns.every((field) => {
                const selected = selectedFilters[field];
                if (!selected || selected.length === 0) return true;
                return selected.some((opt) => opt.value === row[field]);
            });
        });
    }, [data, selectedFilters, filterColumns]);

    const columns = useMemo(() => {
        const allColumns = ['number', ...filterColumns];
        return allColumns.map((col) => ({
            name: col,
            selector: (row: RowData) => row[col],
            sortable: true,
        }));
    }, [filterColumns]);

    return (
        <div className='p-6 bg-white shadow rounded'>
            <div className='flex justify-between'>
                <h2 className="text-2xl font-bold mb-2">Filters</h2>
                <div className="flex flex-wrap gap-4 mb-2">
                    {filterColumns.map((field) => (
                        <div key={field} className="w-56">
                            <label className="block mb-1 text-sm font-medium text-gray-700">{field}</label>
                            <Select
                                isMulti
                                options={getFilteredOptions(field)}
                                value={selectedFilters[field] || []}
                                onChange={(selected) => handleFilterChange(field, selected as Option[])}
                                placeholder={`Select ${field}`}
                                className="text-sm z-50"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <DataTable
                title="Filtered Table"
                columns={columns}
                data={filteredData}
                pagination
                paginationPerPage={100}
                dense
                fixedHeader
                fixedHeaderScrollHeight="400px"
            />
        </div>
    )
}

export default FilterableTable