import React from 'react'
import { Tooltip } from 'react-leaflet';
import { Bar, BarChart, Legend, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { v4 as uuidv4 } from 'uuid';

function Sidebar({ chartData }) {
    console.log(chartData);
    return (
        <div>
            <h3 className="text-lg font-bold mb-2">Average Evaluations</h3>
            {/* Table */}
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-2">Evaluation</th>
                        <th className="border border-gray-300 px-2">Average</th>
                    </tr>
                </thead>
                <tbody>
                    {chartData.map((data) => (
                        <tr key={chartData.map((index) => `${uuidv4()}-${index}`)}>
                            <td className="border border-gray-300 px-2">{data.name.toUpperCase()}</td>
                            <td className="border border-gray-300 px-2">{data.value.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Chart */}
            <h3 className="text-lg font-bold mt-4">Evaluation Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar key={chartData.map((entry, index) => `bar-${entry.name}-${index}`)} dataKey="value" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default Sidebar
