import Link from 'next/link';

const features = [
  {
    href: '/browse',
    title: 'Browse',
    description: 'Explore compositions',
    icon: '📚',
  },
  {
    href: '/player',
    title: 'Player',
    description: 'Play compositions',
    icon: '🎵',
  },
  {
    href: '/upload',
    title: 'Upload',
    description: 'Create new composition',
    icon: '➕',
  },
  {
    href: '/trainer',
    title: 'Trainer',
    description: 'Polyrhythm practice',
    icon: '🥁',
  },
  {
    href: '/lab',
    title: 'Lab',
    description: 'Sound experiments',
    icon: '🔬',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-amber-900 mb-2">
            Tabla
          </h1>
          <p className="text-amber-700 text-lg">
            Indian Classical Rhythm Trainer
          </p>
        </header>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-4 sm:p-6 hover:border-amber-400 hover:shadow-xl transition-all active:scale-95"
            >
              <div className="text-3xl sm:text-4xl mb-2">{feature.icon}</div>
              <h2 className="text-lg sm:text-xl font-semibold text-amber-900">
                {feature.title}
              </h2>
              <p className="text-sm text-amber-600 mt-1">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-amber-600 text-sm">
          <p>Practice tabla rhythms anywhere</p>
        </footer>
      </div>
    </main>
  );
}
