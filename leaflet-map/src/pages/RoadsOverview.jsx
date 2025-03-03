import { useState, useEffect } from "react";
import { fetchRoads } from "../helpers/utils";
import { Helmet } from "react-helmet";

const RoadsOverview = () => {
    const [roads, setRoads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadRoads = async () => {
            try {
                const roadsData = await fetchRoads();
                setRoads(roadsData.features);
                setLoading(false);
            } catch (error) {
                console.error("Error loading roads:", error);
                setError("Failed to load roads data.");
                setLoading(false);
            }
        };
        loadRoads();
    }, []);

    if (loading) return <p className="p-4 text-lg">Loading roads...</p>;
    if (error) return <p className="p-4 text-lg text-red-600">{error}</p>;

    return (
        <div className="p-4 mx-14">
            <Helmet>
                <title>{`RE -> Road Overview`}</title>
            </Helmet>
            <h2 className="text-4xl font-bold my-8 flex justify-center">Roads Overview<img
                src="https://i.ibb.co/btHX7jK/icons8-overview.gif"
                alt="Overview GIF"
                className="w-12 h-12 ml-3"
            /></h2>
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
