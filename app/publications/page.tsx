"use client"
import { loadPublications } from '../../lib/dataService';
import { searchPublications } from '../../lib/aiService';
import { useState } from 'react';

export default async function PublicationsPage() {
  const publications = await loadPublications();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Publications Database</h1>
      <div className="grid gap-6">
        {publications.map((pub) => (
          <div key={pub.doi} className="border p-4 rounded">
            <h2 className="font-bold">{pub.title}</h2>
            <div className="text-sm text-gray-600 mt-1">
              {pub.authors.join(', ')}
            </div>
            <div className="mt-2">{pub.abstract}</div>
            <div className="mt-2 text-sm">
              <span className="font-semibold">DOI: </span>
              <a href={`https://doi.org/${pub.doi}`} className="text-blue-600 hover:underline">
                {pub.doi}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}