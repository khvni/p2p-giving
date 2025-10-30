export default function BadgesPage() {
  const badges = [
    { name: "First Donation", rarity: "Common", description: "Made your first donation", unlocked: true },
    { name: "Generous Giver", rarity: "Rare", description: "Donated RM 1000 or more", unlocked: true },
    { name: "Campaign Creator", rarity: "Common", description: "Created your first campaign", unlocked: false },
    { name: "Fundraising Hero", rarity: "Epic", description: "Raised RM 10,000", unlocked: false },
    { name: "Social Butterfly", rarity: "Common", description: "Shared campaigns 10 times", unlocked: false },
    { name: "Team Player", rarity: "Rare", description: "Joined a fundraising team", unlocked: false },
    { name: "Consistent Giver", rarity: "Epic", description: "Donated for 30 consecutive days", unlocked: false },
    { name: "Impact Champion", rarity: "Legendary", description: "Raised RM 100,000", unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Badges</h1>
        <p className="text-gray-600 mb-8">
          Unlock achievements as you fundraise and make an impact.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge, i) => (
            <div
              key={i}
              className={`bg-white rounded-lg shadow-md p-6 text-center ${
                !badge.unlocked ? 'opacity-50' : ''
              }`}
            >
              <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl ${
                badge.rarity === 'Common' ? 'bg-gray-200' :
                badge.rarity === 'Rare' ? 'bg-blue-200' :
                badge.rarity === 'Epic' ? 'bg-purple-200' :
                'bg-yellow-200'
              }`}>
                🏆
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{badge.name}</h3>
              <p className={`text-xs font-medium mb-2 ${
                badge.rarity === 'Common' ? 'text-gray-600' :
                badge.rarity === 'Rare' ? 'text-blue-600' :
                badge.rarity === 'Epic' ? 'text-purple-600' :
                'text-yellow-600'
              }`}>
                {badge.rarity}
              </p>
              <p className="text-sm text-gray-600">{badge.description}</p>
              {badge.unlocked && (
                <span className="inline-block mt-3 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  Unlocked
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
