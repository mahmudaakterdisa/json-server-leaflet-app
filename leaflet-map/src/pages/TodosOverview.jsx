import { useState, useEffect } from "react";
import { fetchTodos, getStatusColor } from "../helpers/utils";
import { Helmet } from "react-helmet";

const TodosOverview = () => {
    const [todos, setTodos] = useState([]);


    useEffect(() => {
        const loadTodos = async () => {
            try {
                const todosData = await fetchTodos();
                setTodos(todosData);
            } catch (error) {
                console.error("Error loading TODOs:", error);
            }
        };
        loadTodos();
    }, []);

    return (
        <div className="p-4 mx-14">
            <Helmet>
                <title>{`RE -> Todo`}</title>
            </Helmet>
            <h2 className="text-4xl font-bold my-8 text-center">Todos Overview</h2>

            {todos.length === 0 ? (
                <p className="text-gray-500">No TODOs available.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200 text-left">
                                <th className="border border-gray-300 px-4 py-2">Title</th>
                                <th className="border border-gray-300 px-4 py-2">Description</th>
                                <th className="border border-gray-300 px-4 py-2">Status</th>
                                <th className="border border-gray-300 px-4 py-2">Author</th>
                                <th className="border border-gray-300 px-4 py-2">Road ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {todos.map((todo) => (
                                <tr key={todo.id} className="hover:bg-gray-100">
                                    <td className="border border-gray-300 px-4 py-2">{todo.title}</td>
                                    <td className="border border-gray-300 px-4 py-2">{todo.description}</td>
                                    <td className={`border border-gray-300 px-4 py-2 text-white ${getStatusColor(todo.status)}`}>
                                        {todo.status.replace("_", " ").toUpperCase()}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">{todo.author}</td>
                                    <td className="border border-gray-300 px-4 py-2">{todo.road_fid}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TodosOverview;
