import { useState, useEffect } from "react";
import { fetchEvaluations } from "../helpers/utils";
import { Helmet } from "react-helmet";

const EvaluationsOverview = () => {
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [columns, setColumns] = useState(["fid", "name"]);

    useEffect(() => {
        const loadEvaluations = async () => {
            try {
                const { evaluations, columns } = await fetchEvaluations();
                setEvaluations(evaluations);
                setColumns(columns);
                setLoading(false);
            } catch (error) {
                console.error("Error loading evaluations:", error);
                setError("Failed to load evaluations data.");
                setLoading(false);
            }
        };

        loadEvaluations();
    }, []);

    if (loading) return <p className="p-4 text-lg">Loading evaluations...</p>;
    if (error) return <p className="p-4 text-lg text-red-600">{error}</p>;

    return (
        <div className="p-4 mx-14">
            <Helmet>
                <title>{`RE -> Evaluation`}</title>
            </Helmet>
            <h2 className="text-4xl font-bold my-8 flex justify-center">Evaluations Overview<img
                src="https://i.ibb.co/VYNZG7Kw/icons8-scorecard.gif"
                alt="Overview GIF"
                className="w-12 h-12 ml-3"
            /></h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-200">
                        <tr>
                            {columns.map((col) => (
                                <th key={col} className="border border-gray-300 px-4 py-2">{col.toUpperCase()}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {evaluations.map((road) => {
                            const { fid, name, eemi_grade } = road.properties;

                            return (
                                <tr key={fid}>
                                    <td className="border border-gray-300 px-4 py-2">{fid}</td>
                                    <td className="border border-gray-300 px-4 py-2">{name || "N/A"}</td>
                                    {columns.slice(2).map((gradeType) => {
                                        let gradeValue = eemi_grade?.[gradeType] || eemi_grade?.sub_type_grades?.[gradeType] || "N/A";
                                        return (
                                            <td key={gradeType} className="border border-gray-300 px-4 py-2">{gradeValue}</td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EvaluationsOverview;
