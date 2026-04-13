'use client';

export default function CategoryFilter({ selectedCategory, onCategoryChange, viewMode }) {
  const eventCategories = [
    { id: 'all', name: 'Todas', icon: '🎉' },
    { id: 'music', name: 'Música', icon: '🎵' },
    { id: 'sports', name: 'Deportes', icon: '⚽' },
    { id: 'technology', name: 'Tecnología', icon: '💻' },
    { id: 'food', name: 'Gastronomía', icon: '🍕' },
    { id: 'art', name: 'Arte', icon: '🎨' },
    { id: 'business', name: 'Negocios', icon: '💼' },
    { id: 'education', name: 'Educación', icon: '📚' },
    { id: 'health', name: 'Salud', icon: '🏥' },
    { id: 'travel', name: 'Viajes', icon: '✈️' },
  ];

  const tribeCategories = [
    { id: 'all', name: 'Todas', icon: '👥' },
    { id: 'music', name: 'Música', icon: '🎵' },
    { id: 'sports', name: 'Deportes', icon: '⚽' },
    { id: 'technology', name: 'Tecnología', icon: '💻' },
    { id: 'food', name: 'Gastronomía', icon: '🍕' },
    { id: 'art', name: 'Arte', icon: '🎨' },
    { id: 'business', name: 'Negocios', icon: '💼' },
    { id: 'education', name: 'Educación', icon: '📚' },
    { id: 'health', name: 'Salud', icon: '🏥' },
    { id: 'travel', name: 'Viajes', icon: '✈️' },
  ];

  const categories = viewMode === 'events' ? eventCategories : tribeCategories;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedCategory === category.id
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <span className="mr-2">{category.icon}</span>
          {category.name}
        </button>
      ))}
    </div>
  );
}