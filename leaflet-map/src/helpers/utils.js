import api from "../api/api";

// Fetch Roads Data
export const fetchRoads = async () => {
    try {
        const response = await api.get("/roads");
        return response.data;
    } catch (error) {
        console.error("Error fetching roads:", error);
        throw new Error("Failed to load roads data");
    }
};

// Fetch all TODOs from the API
export const fetchTodos = async () => {
    try {
        const response = await api.get("/todos");
        return response.data;
    } catch (error) {
        console.error("Error fetching TODOs:", error);
        throw new Error("Failed to load TODOs");
    }
};

// Add a new TODO
export const addTodo = async (todoData) => {
    try {
        const response = await api.post("/todos", todoData);
        return response.data;
    } catch (error) {
        console.error("Error adding TODO:", error);
        throw new Error("Failed to add TODO");
    }
};

// Fetch Evaluations Data (Extracted from Roads)
export const fetchEvaluations = async () => {
    try {
        const response = await api.get("/roads");
        const roadsData = response.data.features;

        let evalTypes = new Set();
        roadsData.forEach((road) => {
            const grades = road.properties.eemi_grade || {};
            Object.keys(grades).forEach((key) => {
                if (key !== "sub_type_grades") evalTypes.add(key);
            });

            if (grades.sub_type_grades) {
                Object.keys(grades.sub_type_grades).forEach((subKey) => {
                    evalTypes.add(subKey);
                });
            }
        });

        return { evaluations: roadsData, columns: ["fid", "name", ...Array.from(evalTypes)] };
    } catch (error) {
        console.error("Error fetching evaluations:", error);
        throw new Error("Failed to load evaluations data.");
    }
};

// Color Mapping Function
export const getColor = (grade) => {
    if (!grade) return "gray";
    if (grade < 1.5) return "blue";
    if (grade < 2.5) return "lightgreen";
    if (grade < 3.5) return "darkgreen";
    if (grade < 4.5) return "yellow";
    return "red";
};

// Calculate Averages for Evaluation Scores
export const calculateAverages = (data) => {
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

// Email Validation
export const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
};

// Function to get status color
export const getStatusColor = (status) => {
    switch (status) {
        case "pending":
            return "bg-yellow-500";
        case "in_progress":
            return "bg-blue-500";
        case "completed":
            return "bg-green-500";
        default:
            return "bg-gray-500";
    }
};
