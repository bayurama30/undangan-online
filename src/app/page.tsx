import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-amber-50">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl md:text-6xl font-great-vibes text-rose-700">
          Undangan Online
        </h1>
        <p className="text-lg text-gray-600 max-w-md">
          Buat undangan pernikahan dan tunangan online dengan mudah
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/admin/login"
            className="px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
          >
            Login Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
