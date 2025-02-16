import { useState, useEffect } from "react";
import api from "../api/api";

const RoadsOverview = () => {
    const [roads, setRoads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRoads = async () => {
            try {
                const response = await api.get("/roads");
                console.log(response);
                setRoads(response.data.features);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching roads:", error);
                setError("Failed to load roads data.");
                setLoading(false);
            }
        };

        fetchRoads();
    }, []);

    if (loading) return <p className="p-4 text-lg">Loading roads...</p>;
    if (error) return <p className="p-4 text-lg text-red-600">{error}</p>;

    return (
        <div className="p-4 mx-14">
            <h2 className="text-4xl font-bold my-8 text-center">Roads Overview</h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">Road ID</th>
                            <th className="border border-gray-300 px-4 py-2">Road Name</th>
                            <th className="border border-gray-300 px-4 py-2">EVNK</th>
                            <th className="border border-gray-300 px-4 py-2">ENNK</th>
                            <th className="border border-gray-300 px-4 py-2">Length (m)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roads.map((road) => (
                            <tr key={road.properties.fid}>
                                <td className="border border-gray-300 px-4 py-2">{road.properties.fid}</td>
                                <td className="border border-gray-300 px-4 py-2">{road.properties.name || "N/A"}</td>
                                <td className="border border-gray-300 px-4 py-2">{road.properties.evnk}</td>
                                <td className="border border-gray-300 px-4 py-2">{road.properties.ennk}</td>
                                <td className="border border-gray-300 px-4 py-2">{road.properties.len}m</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RoadsOverview;
