import Link from "next/link";

export default function TeamsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900">Teams</h1>
          <Link
            href="/teams/new"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Create Team
          </Link>
        </div>
        <p className="text-gray-600 mb-8">
          Join a team or create your own to fundraise together.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Team {i}</h3>
                  <p className="text-sm text-gray-600">{5 + i} members</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Team description placeholder...
              </p>
              <div className="bg-gray-200 h-2 rounded-full mb-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>RM {(7000 + i * 1000).toLocaleString()} raised</span>
                <span>RM 10,000 goal</span>
              </div>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                Join Team
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
