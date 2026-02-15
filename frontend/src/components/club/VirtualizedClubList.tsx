import React, { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import ClubCard from './ClubCard';

interface Club {
  id: string;
  name: string;
  description: string;
  school: string;
  category: string;
  sponsor: string;
  [key: string]: any;
}

interface VirtualizedClubListProps {
  clubs: Club[];
  onSelectClub?: (id: string) => void;
  CategoryColors?: Record<string, string>;
  height?: number;
  itemHeight?: number;
}

// Virtualized club list for performance with large datasets
const VirtualizedClubList = memo(({
  clubs,
  onSelectClub,
  CategoryColors,
  height = 600,
  itemHeight = 200
}: VirtualizedClubListProps) => {
  // Memoize the club data to prevent unnecessary re-renders
  const memoizedClubs = useMemo(() => clubs, [clubs]);

  // Item renderer for the virtualized list
  const ClubItem = memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const club = memoizedClubs[index];

    return (
      <div style={style} className="px-4 py-2">
        <ClubCard
          club={club}
          onSelectClub={onSelectClub}
          CategoryColors={CategoryColors}
        />
      </div>
    );
  });

  ClubItem.displayName = 'ClubItem';

  if (!memoizedClubs || memoizedClubs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No clubs found</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <List
        height={height}
        width="100%"
        itemCount={memoizedClubs.length}
        itemSize={itemHeight}
        overscanCount={5} // Render 5 extra items for smooth scrolling
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {ClubItem}
      </List>
    </div>
  );
});

VirtualizedClubList.displayName = 'VirtualizedClubList';

export default VirtualizedClubList;
