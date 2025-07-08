import axios from "axios"
import { useEffect, useState } from "react"
import Papa, { type ParseResult } from 'papaparse';
import FilterableTable, { type RowData } from "./FilterableTable";
import Swap from "./icons/Swap";
import { useFilterContext } from "../other/FilterContext";

function DataTableComp() {
    const [data, setData] = useState<RowData[]>([])
    const [loading, setLoading] = useState(true)
    const { useLargeData, setUseLargeData } = useFilterContext();

    useEffect(() => {
        setLoading(true);
        const datasetFile = useLargeData
            ? '/data/dataset_large.csv'
            : '/data/dataset_small.csv';

        axios.get(datasetFile)
            .then(res => {
                Papa.parse(res.data, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results: ParseResult<RowData>) => {
                    setData(results.data);
                    setLoading(false);
                },
                error: (error) => {
                    console.error('Parsing error:', error);
                    setLoading(false);
                }
                })
            })
            .catch((error) => {
                console.error('Error loading CSV:', error);
                setLoading(false)
            });
    }, [useLargeData])

    if (loading) return <div>Loading data...</div>;

    return (
        <>
            <div className="w-full flex px-6 justify-end mt-2">
                <button 
                    className="bg-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-300/80 cursor-pointer transition flex items-center gap-1.5"
                    onClick={() => setUseLargeData(!useLargeData)}
                >
                    <span><Swap /></span>{" "}{useLargeData ? 'Small Data' : 'Large Data'}
                </button>
            </div>
            {loading ? <p>Loading...</p> : <FilterableTable data={data} />}
        </>
    )
}

export default DataTableComp
