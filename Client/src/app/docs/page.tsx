import Navbar from "@/src/components/layout/Navbar";

export default function Documentation() {
  return (
    <div className="min-h-screen bg-black text-white ">
      <Navbar />
      <h1 className="text-4xl font-bold mb-4 py-6 text-center">Demo</h1>
      <div className="max-w-3xl mx-auto mt-8">
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 flex flex-col items-center justify-center">
          <div className="bg-gray-800 p-4 rounded-md mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
          <p className="text-xl text-gray-300 text-center">
            Demo video coming soon
          </p>
          <p className="text-gray-400 mt-2 text-center">
            This is a placeholder for the demo video that will be integrated
            later
          </p>
        </div>
      </div>
    </div>
  );
}

