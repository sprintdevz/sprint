import type { SportMeta } from '@/sports/types';

export const soccerMeta: SportMeta = {
  id: 'soccer',
  name: 'Soccer',
  code: 'soccer',
  icon: 'football',
  tagline: 'Command the pitch.',
  description: 'First touch, passing, finishing and the engine to press for 90 minutes.',
  primaryColor: '#22C55E',
  secondaryColor: '#0B1B3A',
  positions: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'],
  locations: ['Grass pitch', 'Turf pitch', 'Indoor arena'],
};