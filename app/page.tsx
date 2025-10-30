import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900">
            MyFundAction
          </h1>
          <p className="text-2xl text-gray-600">
            Peer-to-Peer Giving Platform
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Amplify generosity through gamified peer-to-peer fundraising for Islamic charity and humanitarian causes
          </p>

          <div className="flex gap-4 justify-center mt-8">
            <Link
              href="/campaigns"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse Campaigns
            </Link>
            <Link
              href="/campaigns/new"
              className="bg-white hover:bg-gray-50 text-green-600 border-2 border-green-600 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Start a Campaign
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Campaigns</h3>
              <p className="text-gray-600">Start your own fundraising campaign and make a difference</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Earn Badges</h3>
              <p className="text-gray-600">Unlock achievements and climb the leaderboard</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Build Teams</h3>
              <p className="text-gray-600">Join forces with others to amplify your impact</p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-4">
            <Link href="/campaigns" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <p className="font-semibold text-gray-900">Campaigns</p>
            </Link>
            <Link href="/leaderboard" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <p className="font-semibold text-gray-900">Leaderboard</p>
            </Link>
            <Link href="/teams" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <p className="font-semibold text-gray-900">Teams</p>
            </Link>
            <Link href="/badges" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <p className="font-semibold text-gray-900">Badges</p>
            </Link>
            <Link href="/impact" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <p className="font-semibold text-gray-900">Impact</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
