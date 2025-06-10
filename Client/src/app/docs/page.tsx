import Navbar from "@/src/components/layout/Navbar";

export default function Documentation() {
  return (
    <div className="min-h-screen bg-black text-white ">
      <Navbar />
      <h1 className="text-4xl font-bold mb-4 py-6 text-center">Demo Video</h1>
      <div className="max-w-5xl mx-auto mt-8 flex flex-col items-center">
        <div className="flex justify-center w-full">
          <div className="relative max-w-[900px] w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-md"
              src="https://www.youtube.com/embed/VQUk5Eiw33E"
              title="Demo Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}

