export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Our Impact</h1>
        <p className="text-gray-600 mb-8">
          See the collective impact of our community's generosity.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">RM 2.5M</div>
            <p className="text-gray-600">Total Raised</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">450</div>
            <p className="text-gray-600">Active Campaigns</p>
          </div>
          <div className="bg-white rounded-md shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">12,500</div>
            <p className="text-gray-600">Total Donors</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">8,000</div>
            <p className="text-gray-600">Lives Impacted</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Impact by Category</h2>
          <div className="space-y-4">
            {[
              { category: 'Education', amount: 'RM 800,000', percentage: 32 },
              { category: 'Healthcare', amount: 'RM 625,000', percentage: 25 },
              { category: 'Food Relief', amount: 'RM 500,000', percentage: 20 },
              { category: 'Zakat', amount: 'RM 375,000', percentage: 15 },
              { category: 'Other', amount: 'RM 200,000', percentage: 8 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-900">{item.category}</span>
                  <span className="text-gray-600">{item.amount}</span>
                </div>
                <div className="bg-gray-200 h-3 rounded-full">
                  <div
                    className="bg-green-600 h-3 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Success Stories</h2>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-gray-200 pb-6 last:border-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Campaign Successfully Funded
                </h3>
                <p className="text-gray-600 mb-2">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Raised RM 15,000 to help 50 families.
                </p>
                <p className="text-sm text-gray-500">Completed 2 days ago</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
