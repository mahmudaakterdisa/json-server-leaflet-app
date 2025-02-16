import { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../api/api";

const fetchRoads = async () => {
    try {
        const response = await api.get("/roads");
        return response.data;
    } catch (error) {
        console.error("Error fetching roads:", error);
        throw new Error("Failed to load roads data");
    }
};

const getColor = (grade) => {
    if (!grade) return "gray"; // Handle missing values
    if (grade < 1.5) return "blue";
    if (grade < 2.5) return "lightgreen";
    if (grade < 3.5) return "darkgreen";
    if (grade < 4.5) return "yellow";
    return "red";
};

const calculateAverages = (data) => {
    if (!data) return {};

    let sum = {};
    let count = {};

    data.features.forEach((feature) => {
        const grades = feature.properties.eemi_grade;
        Object.keys(grades).forEach((key) => {
            if (typeof grades[key] === "number") {
                sum[key] = (sum[key] || 0) + grades[key];
                count[key] = (count[key] || 0) + 1;
            }
        });

        if (grades.sub_type_grades) {
            Object.keys(grades.sub_type_grades).forEach((subKey) => {
                sum[subKey] = (sum[subKey] || 0) + grades.sub_type_grades[subKey];
                count[subKey] = (count[subKey] || 0) + 1;
            });
        }
    });

    let averages = {};
    Object.keys(sum).forEach((key) => {
        averages[key] = sum[key] / count[key];
    });

    return averages;
};

// Custom Component to handle dynamic map updates
const RoadsLayer = ({ data, selectedEvaluation, selectedSubEvaluation }) => {
    const map = useMap();

    useEffect(() => {
        if (!data || !map) return;

        // Remove previous layers before adding new ones
        map.eachLayer((layer) => {
            if (layer instanceof L.GeoJSON) {
                map.removeLayer(layer);
            }
        });

        const roadsLayer = new L.GeoJSON(data, {
            style: (feature) => {
                const grades = feature.properties.eemi_grade;
                const color = selectedEvaluation === "sub_type_grades"
                    ? getColor(grades?.sub_type_grades?.[selectedSubEvaluation])
                    : getColor(grades?.[selectedEvaluation]);

                return { color, weight: 5 };
            },
            onEachFeature: (feature, layer) => {
                layer.on({
                    mouseover: (e) => {
                        e.target.setStyle({ weight: 8 });

                        const props = feature.properties;
                        const roadID = props.fid || "N/A";
                        const evaluationValue =
                            selectedEvaluation === "sub_type_grades"
                                ? props.eemi_grade?.sub_type_grades?.[selectedSubEvaluation] ?? "N/A"
                                : props.eemi_grade?.[selectedEvaluation] ?? "N/A";

                        const evaluationTitle =
                            selectedEvaluation === "sub_type_grades"
                                ? `Sub-Type: ${selectedSubEvaluation.toUpperCase()}`
                                : selectedEvaluation.toUpperCase();

                        const popupContent = `
                            <div>
                                <strong>Road ID:</strong> ${roadID}<br/>
                                <strong>${evaluationTitle}:</strong> ${evaluationValue}<br/>
                                <strong>EVNK:</strong> ${props.evnk}<br/>
                                <strong>ENNK:</strong> ${props.ennk}<br/>
                                <strong>Length:</strong> ${props.len}m<br/>
                            </div>`;

                        layer.bindPopup(popupContent).openPopup();
                    },
                    mouseout: (e) => {
                        e.target.setStyle({ weight: 5 });
                        layer.closePopup();
                    }
                });
            }
        });

        roadsLayer.addTo(map);
    }, [data, selectedEvaluation, selectedSubEvaluation, map]);

    return null;
};

const MapComponent = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["roads"],
        queryFn: fetchRoads,
    });

    const [selectedEvaluation, setSelectedEvaluation] = useState("gw");
    const [evaluationOptions, setEvaluationOptions] = useState([]);
    const [selectedSubEvaluation, setSelectedSubEvaluation] = useState("");
    const [subEvaluationOptions, setSubEvaluationOptions] = useState([]);

    useEffect(() => {
        if (data) {
            const feature = data.features[0]?.properties?.eemi_grade;
            if (feature) {
                setEvaluationOptions(Object.keys(feature));
            }
        }
    }, [data]);

    useEffect(() => {
        if (selectedEvaluation === "sub_type_grades" && data) {
            const subGrades = data.features[0]?.properties?.eemi_grade?.sub_type_grades;
            if (subGrades) {
                setSubEvaluationOptions(Object.keys(subGrades));
                setSelectedSubEvaluation(Object.keys(subGrades)[0]);
            }
        } else {
            setSubEvaluationOptions([]);
            setSelectedSubEvaluation("");
        }
    }, [selectedEvaluation, data]);

    const averages = calculateAverages(data);
    const chartData = Object.keys(averages).map((key) => ({ name: key, value: averages[key] }));

    return (
        <div className="relative h-screen flex">
            {/* Map Area - 70% */}
            <div className="w-[70%]">
                <MapContainer center={[51.1657, 10.4515]} zoom={6} className="w-full h-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {isLoading && <p>Loading roads...</p>}
                    {error && <p className="text-red-600">Error loading roads: {error.message}</p>}
                    {data && <RoadsLayer data={data} selectedEvaluation={selectedEvaluation} selectedSubEvaluation={selectedSubEvaluation} />}
                </MapContainer>
                <div className="fixed top-48 left-4 bg-white p-2 shadow-md rounded-md z-[1000]">
                    <label className="block text-sm font-semibold">Select Evaluation:</label>
                    <select
                        className="mt-1 p-2 w-full border border-gray-400 rounded-md bg-white text-black cursor-pointer"
                        onChange={(e) => setSelectedEvaluation(e.target.value)}
                        value={selectedEvaluation}
                    >
                        {evaluationOptions.map((evalType) => (
                            <option key={evalType} value={evalType}>
                                {evalType.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Second Dropdown for Sub-Evaluations */}
                {selectedEvaluation === "sub_type_grades" && subEvaluationOptions.length > 0 && (
                    <div className="fixed top-48 left-56 bg-white p-2 shadow-md rounded-md z-[1000]">
                        <label className="block text-sm font-semibold">Select Sub-Type:</label>
                        <select
                            className="mt-1 p-2 w-full border border-gray-400 rounded-md bg-white text-black cursor-pointer"
                            onChange={(e) => setSelectedSubEvaluation(e.target.value)}
                            value={selectedSubEvaluation}
                        >
                            {subEvaluationOptions.map((subEval) => (
                                <option key={subEval} value={subEval}>
                                    {subEval.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Legend */}
                <div className="fixed bottom-4 left-4 bg-white p-3 shadow-md rounded-md z-[1000] border border-gray-300">
                    <h3 className="text-sm font-bold">Legend</h3>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-500 mr-2"></div> <span>1 - 1.49</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-300 mr-2"></div> <span>1.5 - 2.49</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-600 mr-2"></div> <span>2.5 - 3.49</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-500 mr-2"></div> <span>3.5 - 4.49</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-500 mr-2"></div> <span>4.5 - 5.0</span>
                    </div>
                </div>
            </div>

            {/* Sidebar - 30% */}
            <div className="w-[30%] bg-white shadow-md p-4">
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
                        {Object.keys(averages).map((key) => (
                            <tr key={key}>
                                <td className="border border-gray-300 px-2">{key.toUpperCase()}</td>
                                <td className="border border-gray-300 px-2">{averages[key].toFixed(2)}</td>
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
        </div>
    );
};

export default MapComponent;
