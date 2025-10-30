export default function CampaignsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Campaigns</h1>
        <p className="text-gray-600 mb-8">
          Browse active fundraising campaigns and make a difference today.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Campaign Title {i}
              </h3>
              <p className="text-gray-600 mb-4">
                Campaign description placeholder...
              </p>
              <div className="bg-gray-200 h-2 rounded-full mb-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>RM 6,000 raised</span>
                <span>RM 10,000 goal</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
