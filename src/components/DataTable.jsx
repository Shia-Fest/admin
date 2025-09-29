import React from 'react';

const DataTable = ({ headers, data, renderRow }) => {
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full">
                <thead className="bg-gray-50">
                    <tr>
                        {headers.map((header) => (
                            <th key={header} className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.length > 0 ? (
                        data.map(renderRow)
                    ) : (
                        <tr>
                            <td colSpan={headers.length} className="px-6 py-4 text-sm text-center text-gray-500">
                                No data available for this selection.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
