import { Link } from "react-router-dom";
import { warning } from "../assets/index";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-2xl border border-[#CBD5E1] rounded-xl p-6 bg-white shadow-sm text-center">
        <img
          src={warning as string}
          alt="Not found"
          className="mx-auto h-40 w-auto mb-6"
        />
        <h2 className="text-2xl font-bold mb-2">Page not found</h2>
        <p className="text-sm text-gray-500 mb-6">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-md py-2 px-6 font-semibold transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
