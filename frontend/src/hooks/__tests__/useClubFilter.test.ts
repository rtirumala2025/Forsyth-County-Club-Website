import { renderHook } from '@testing-library/react';
import { useClubFilter, useClubById, useClubsByCategory } from '../useClubFilter';

// Mock club data
const mockClubs = [
  {
    id: '1',
    name: 'Chess Club',
    category: 'Academic',
    school: 'West Forsyth High School',
    sponsor: 'Mr. Smith',
    description: 'Learn and play chess'
  },
  {
    id: '2',
    name: 'Art Club',
    category: 'Arts',
    school: 'West Forsyth High School',
    sponsor: 'Ms. Johnson',
    description: 'Express creativity through art'
  },
  {
    id: '3',
    name: 'Basketball Club',
    category: 'Athletics',
    school: 'North Forsyth High School',
    sponsor: 'Coach Wilson',
    description: 'Play basketball and improve skills'
  },
  {
    id: '4',
    name: 'Math Club',
    category: 'Academic',
    school: 'North Forsyth High School',
    sponsor: 'Dr. Brown',
    description: 'Advanced mathematics and competitions'
  }
];

describe('useClubFilter', () => {
  it('should group clubs by category', () => {
    const { result } = renderHook(() => useClubFilter(mockClubs));
    
    expect(result.current.clubsByCategory).toEqual({
      'Academic': [
        { id: '1', name: 'Chess Club', category: 'Academic', school: 'West Forsyth High School', sponsor: 'Mr. Smith', description: 'Learn and play chess' },
        { id: '4', name: 'Math Club', category: 'Academic', school: 'North Forsyth High School', sponsor: 'Dr. Brown', description: 'Advanced mathematics and competitions' }
      ],
      'Arts': [
        { id: '2', name: 'Art Club', category: 'Arts', school: 'West Forsyth High School', sponsor: 'Ms. Johnson', description: 'Express creativity through art' }
      ],
      'Athletics': [
        { id: '3', name: 'Basketball Club', category: 'Athletics', school: 'North Forsyth High School', sponsor: 'Coach Wilson', description: 'Play basketball and improve skills' }
      ]
    });
  });

  it('should filter clubs by search term', () => {
    const { result } = renderHook(() => useClubFilter(mockClubs, 'chess'));
    
    expect(result.current.filteredClubs).toEqual({
      'Academic': [
        { id: '1', name: 'Chess Club', category: 'Academic', school: 'West Forsyth High School', sponsor: 'Mr. Smith', description: 'Learn and play chess' }
      ]
    });
  });

  it('should filter clubs by category', () => {
    const { result } = renderHook(() => useClubFilter(mockClubs, '', 'Academic'));
    
    expect(result.current.filteredClubs).toEqual({
      'Academic': [
        { id: '1', name: 'Chess Club', category: 'Academic', school: 'West Forsyth High School', sponsor: 'Mr. Smith', description: 'Learn and play chess' },
        { id: '4', name: 'Math Club', category: 'Academic', school: 'North Forsyth High School', sponsor: 'Dr. Brown', description: 'Advanced mathematics and competitions' }
      ]
    });
  });

  it('should combine search and category filters', () => {
    const { result } = renderHook(() => useClubFilter(mockClubs, 'math', 'Academic'));
    
    expect(result.current.filteredClubs).toEqual({
      'Academic': [
        { id: '4', name: 'Math Club', category: 'Academic', school: 'North Forsyth High School', sponsor: 'Dr. Brown', description: 'Advanced mathematics and competitions' }
      ]
    });
  });

  it('should return correct statistics', () => {
    const { result } = renderHook(() => useClubFilter(mockClubs, 'chess'));
    
    expect(result.current.stats).toEqual({
      totalClubs: 4,
      totalCategories: 3,
      filteredClubs: 1,
      filteredCategories: 1
    });
  });

  it('should return categories list', () => {
    const { result } = renderHook(() => useClubFilter(mockClubs));
    
    expect(result.current.categories).toEqual(['Academic', 'Arts', 'Athletics']);
  });

  it('should handle empty clubs array', () => {
    const { result } = renderHook(() => useClubFilter([]));
    
    expect(result.current.clubsByCategory).toEqual({});
    expect(result.current.filteredClubs).toEqual({});
    expect(result.current.flatFilteredClubs).toEqual([]);
    expect(result.current.stats).toEqual({
      totalClubs: 0,
      totalCategories: 0,
      filteredClubs: 0,
      filteredCategories: 0
    });
    expect(result.current.categories).toEqual([]);
  });

  it('should handle clubs without category', () => {
    const clubsWithoutCategory = [
      { id: '1', name: 'Test Club', school: 'Test School' }
    ];
    
    const { result } = renderHook(() => useClubFilter(clubsWithoutCategory));
    
    expect(result.current.clubsByCategory).toEqual({
      'Other': [{ id: '1', name: 'Test Club', school: 'Test School' }]
    });
  });
});

describe('useClubById', () => {
  it('should return club by ID', () => {
    const { result } = renderHook(() => useClubById(mockClubs, '1'));
    
    expect(result.current).toEqual({
      id: '1',
      name: 'Chess Club',
      category: 'Academic',
      school: 'West Forsyth High School',
      sponsor: 'Mr. Smith',
      description: 'Learn and play chess'
    });
  });

  it('should return null for non-existent ID', () => {
    const { result } = renderHook(() => useClubById(mockClubs, '999'));
    
    expect(result.current).toBeNull();
  });

  it('should return null for empty clubs array', () => {
    const { result } = renderHook(() => useClubById([], '1'));
    
    expect(result.current).toBeNull();
  });
});

describe('useClubsByCategory', () => {
  it('should return clubs by category', () => {
    const { result } = renderHook(() => useClubsByCategory(mockClubs, 'Academic'));
    
    expect(result.current).toEqual([
      { id: '1', name: 'Chess Club', category: 'Academic', school: 'West Forsyth High School', sponsor: 'Mr. Smith', description: 'Learn and play chess' },
      { id: '4', name: 'Math Club', category: 'Academic', school: 'North Forsyth High School', sponsor: 'Dr. Brown', description: 'Advanced mathematics and competitions' }
    ]);
  });

  it('should return empty array for non-existent category', () => {
    const { result } = renderHook(() => useClubsByCategory(mockClubs, 'NonExistent'));
    
    expect(result.current).toEqual([]);
  });

  it('should return empty array for empty clubs array', () => {
    const { result } = renderHook(() => useClubsByCategory([], 'Academic'));
    
    expect(result.current).toEqual([]);
  });
});
