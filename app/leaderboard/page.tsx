export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Leaderboard</h1>
        <p className="text-gray-600 mb-8">
          Top fundraisers, donors, and teams making the biggest impact.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button className="bg-white hover:bg-green-50 border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg font-semibold transition-colors">
            Top Fundraisers
          </button>
          <button className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors">
            Top Donors
          </button>
          <button className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors">
            Top Teams
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount Raised</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Campaigns</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 font-semibold">
                        {i}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                        <span className="font-medium text-gray-900">User {i}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      RM {(10000 - i * 500).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{10 - i + 1} campaigns</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
