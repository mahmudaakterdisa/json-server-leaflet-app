import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="bg-blue-600 p-4 h-24 items-center text-white flex justify-between shadow-md">
            <h1 className="text-6xl font-medium ">Road Evaluator</h1>
            <div className="space-x-4">
                <Link to="/" className=" text-white hover:text-black">Map</Link>
                <Link to="/roads" className=" text-white">Roads Overview</Link>
                <Link to="/evaluations" className=" text-white">Evaluations</Link>
                <Link to="/todos" className=" text-white">Todos</Link>
            </div>
        </nav>
    );
};

export default Navbar;
