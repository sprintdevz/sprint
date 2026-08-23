import type { SportMeta } from '@/sports/types';

export const basketballMeta: SportMeta = {
  id: 'basketball',
  name: 'Basketball',
  code: 'basketball',
  icon: 'basketball',
  tagline: 'Own the floor.',
  description: 'Shooting, ball handling, finishing, defense and the athletic tools to make them count.',
  primaryColor: '#FF7A1A',
  secondaryColor: '#2E6BFF',
  positions: [
    'Point Guard',
    'Shooting Guard',
    'Small Forward',
    'Power Forward',
    'Center',
  ],
  locations: ['Indoor court', 'Outdoor court', 'Home / driveway', 'Gym'],
};