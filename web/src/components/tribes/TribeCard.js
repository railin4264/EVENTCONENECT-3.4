'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function TribeCard({ tribe }) {
  const [isJoined, setIsJoined] = useState(tribe.isJoined || false);

  const handleJoin = (e) => {
    e.preventDefault();
    setIsJoined(!isJoined);
  };

  return (
    <Link href={`/tribes/${tribe._id}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        {/* Imagen de la tribu */}
        <div className="relative h-48 bg-gray-200">
          {tribe.image ? (
            <img
              src={tribe.image}
              alt={tribe.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-600">
              <span className="text-white text-4xl">👥</span>
            </div>
          )}
          
          {/* Badge de categoría */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
              {tribe.category}
            </span>
          </div>

          {/* Badge de privacidad */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              tribe.isPrivate 
                ? 'bg-red-600 text-white' 
                : 'bg-green-600 text-white'
            }`}>
              {tribe.isPrivate ? 'Privada' : 'Pública'}
            </span>
          </div>
        </div>

        {/* Contenido de la tribu */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {tribe.name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {tribe.description}
          </p>

          {/* Información de la tribu */}
          <div className="space-y-2 mb-4">
            {tribe.location && (
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {tribe.location}
              </div>
            )}
            
            {tribe.website && (
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
                {tribe.website}
              </div>
            )}
          </div>

          {/* Líder de la tribu */}
          {tribe.leader && (
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                {tribe.leader.avatar ? (
                  <img
                    src={tribe.leader.avatar}
                    alt={tribe.leader.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-600">
                    {tribe.leader.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {tribe.leader.name}
                </p>
                <p className="text-xs text-gray-500">Líder</p>
              </div>
            </div>
          )}

          {/* Estadísticas */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {tribe.members?.length || 0} miembros
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {tribe.events?.length || 0} eventos
              </span>
            </div>
            
            {/* Botón de unirse */}
            <button
              onClick={handleJoin}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isJoined
                  ? 'bg-green-600 text-white'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isJoined ? 'Unido' : 'Unirse'}
            </button>
          </div>

          {/* Tags */}
          {tribe.tags && tribe.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {tribe.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {tribe.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{tribe.tags.length - 3} más
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}