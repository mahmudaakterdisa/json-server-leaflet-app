import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 p-4 h-24 items-center text-white flex justify-between shadow-md border-b-1 border-black" >
            <h1 className="text-6xl font-extralight flex justify-center">Road Evaluator<img
                src="https://i.ibb.co/8nJD31Z5/7a-QCHCe-Bx-M-1.gif"
                alt="Overview GIF"
                className="w-16 h-16 ml-3"
            /></h1>
            <div className="space-x-14 text-2xl">
                <Link to="/" className=" text-white hover:text-black hover:text-3xl hover:underline">Map</Link>
                <Link to="/roads" className=" text-white hover:text-black hover:text-3xl hover:underline">Roads Overview</Link>
                <Link to="/evaluations" className=" text-white hover:text-black hover:text-3xl hover:underline">Evaluations</Link>
                <Link to="/todos" className=" text-white hover:text-black hover:text-3xl hover:underline">Todos</Link>
            </div>
        </nav>
    );
};

export default Navbar;