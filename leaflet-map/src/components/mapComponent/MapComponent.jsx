import { useState, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useQuery } from "@tanstack/react-query";
import RoadsLayer from "../RoadsLayer";
import { addTodo, calculateAverages, fetchRoads, validateEmail } from "../../helpers/utils";
import Sidebar from "./component/Sidebar";
import { Helmet } from "react-helmet";

const MapComponent = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["roads"],
        queryFn: fetchRoads,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoad, setSelectedRoad] = useState(null);
    const [todoTitle, setTodoTitle] = useState("");
    const [todoDescription, setTodoDescription] = useState("");
    const [todoStatus, setTodoStatus] = useState("pending");
    const [todoAuthor, setTodoAuthor] = useState("");

    const [selectedEvaluation, setSelectedEvaluation] = useState("gw");
    const [evaluationOptions, setEvaluationOptions] = useState([]);
    const [selectedSubEvaluation, setSelectedSubEvaluation] = useState("");
    const [subEvaluationOptions, setSubEvaluationOptions] = useState([]);

    const handleSubmitTodo = async () => {
        if (!selectedRoad) return;

        const newTodo = {
            title: todoTitle,
            description: todoDescription,
            status: todoStatus,
            author: todoAuthor,
            road_fid: selectedRoad
        };

        try {
            await addTodo(newTodo);
            alert("TODO added successfully!");

            setIsModalOpen(false);
        } catch (error) {
            console.error("Error adding TODO:", error);
            alert("Failed to add TODO");
        }
    };

    useEffect(() => {
        if (data) {
            console.log(data)
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
            <Helmet>
                <title>{`RE -> Map`}</title>
            </Helmet>
            {/* Map Area - 70% */}
            <div className="w-[70%]">
                <MapContainer center={[48.3450, 10.8994]} zoom={8} className="w-full h-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {isLoading && <p>Loading roads...</p>}
                    {error && <p className="text-red-600">Error loading roads: {error.message}</p>}
                    {data && <RoadsLayer data={data} selectedEvaluation={selectedEvaluation} selectedSubEvaluation={selectedSubEvaluation}
                        setSelectedRoad={setSelectedRoad}
                        setIsModalOpen={setIsModalOpen} />}
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
                <Sidebar chartData={chartData} />
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
                    <div className="bg-white p-6 rounded-md w-96">
                        <h3 className="text-lg font-bold mb-2">Add TODO for Road {selectedRoad}</h3>
                        <input
                            type="text"
                            className="w-full border p-2 mb-2"
                            placeholder="Title"
                            value={todoTitle}
                            onChange={(e) => setTodoTitle(e.target.value)}
                        />
                        <textarea
                            className="w-full border p-2 mb-2"
                            placeholder="Description"
                            value={todoDescription}
                            onChange={(e) => setTodoDescription(e.target.value)}
                        />
                        <select
                            className="w-full border p-2 mb-2"
                            value={todoStatus}
                            onChange={(e) => setTodoStatus(e.target.value)}
                        >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                        <input
                            type="email"
                            className="w-full border p-2 mb-2"
                            placeholder="Author Email"
                            value={todoAuthor}
                            onChange={(e) => setTodoAuthor(e.target.value)}
                            onBlur={(e) => {
                                if (!validateEmail(e.target.value)) {
                                    alert("Please enter a valid email address.");
                                }
                            }}
                        />
                        <div className="flex justify-end">
                            <button className="bg-gray-500 text-white px-4 py-2 mr-2 rounded" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSubmitTodo}>Add TODO</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default MapComponent;
