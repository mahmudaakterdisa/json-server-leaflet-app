import { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useQuery } from "@tanstack/react-query";
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

// Custom Component to handle dynamic map updates
const RoadsLayer = ({ data, selectedEvaluation, selectedSubEvaluation }) => {
    const map = useMap();

    useEffect(() => {
        if (!data) return;

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
                        const roadID = props.fid || "N/A"; // Corrected ID
                        const evaluationValue =
                            selectedEvaluation === "sub_type_grades"
                                ? props.eemi_grade?.sub_type_grades?.[selectedSubEvaluation] ?? "N/A"
                                : props.eemi_grade?.[selectedEvaluation] ?? "N/A";

                        // Correct Tooltip Title Based on Selection
                        const evaluationTitle =
                            selectedEvaluation === "sub_type_grades"
                                ? `Sub-Type: ${selectedSubEvaluation.toUpperCase()}`
                                : selectedEvaluation.toUpperCase();

                        // Create Popup Content
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

    return null; // This component just updates the map layers
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
                setSelectedSubEvaluation(Object.keys(subGrades)[0]); // Default to first sub-type
            }
        } else {
            setSubEvaluationOptions([]);
            setSelectedSubEvaluation("");
        }
    }, [selectedEvaluation, data]);

    return (
        <div className="relative h-screen">
            {/* UI Controls */}
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

            {/* Leaflet Map */}
            <MapContainer center={[51.1657, 10.4515]} zoom={6} className="w-full h-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {isLoading && <p>Loading roads...</p>}
                {error && <p className="text-red-600">Error loading roads: {error.message}</p>}
                {data && <RoadsLayer data={data} selectedEvaluation={selectedEvaluation} selectedSubEvaluation={selectedSubEvaluation} />}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
