export default function CampaignDetailPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-200 h-96 rounded-lg mb-6"></div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Campaign Title - {params.slug}
            </h1>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Story</h2>
              <p className="text-gray-600 leading-relaxed">
                This is a placeholder for the campaign story. The actual campaign content will be displayed here.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recent Donations</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Anonymous Donor</p>
                      <p className="text-sm text-gray-600">Donated RM 100 • 2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">RM 6,000</div>
                <div className="text-gray-600 mb-4">raised of RM 10,000 goal</div>
                <div className="bg-gray-200 h-3 rounded-full mb-2">
                  <div className="bg-green-600 h-3 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <p className="text-sm text-gray-600">60% funded • 15 days left</p>
              </div>

              <button className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold mb-4 transition-colors">
                Donate Now
              </button>

              <button className="w-full bg-white hover:bg-gray-50 text-green-600 border-2 border-green-600 px-6 py-3 rounded-lg font-semibold transition-colors">
                Share Campaign
              </button>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Campaign Creator</p>
                    <p className="text-sm text-gray-600">Organizer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
