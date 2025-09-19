import React from "react";

const DataTable = ({ headers, data, renderRow }) => {
    return (
        <div>
            <table>
                <thead>
                    <tr>
                        {headers.map((header) => (
                            <th key={header}>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map(renderRow)
                    ) : (
                        <tr colSpan={headers.length}>
                            No data available...
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default DataTable;