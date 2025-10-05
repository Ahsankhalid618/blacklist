import { Publication } from '../types/publication';

export async function loadPublications(): Promise<Publication[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const isServer = typeof window === 'undefined';
    const url = isServer ? `${baseUrl}/api/publications` : '/api/publications';
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch publications');
    }
    const data = await response.json();
    return data.publications;
  } catch (error) {
    console.error('Error loading publications:', error);
    return [];
  }
}