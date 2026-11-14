"use client";
import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { GridIcon, ListIcon } from './icons';
import { SORTS, type Paging, type Sort, type View } from './model';

type Props = {
  paging: Paging;
  view: View;
  sort: Sort;
  onView: (v: View) => void;
  onSort: (s: Sort) => void;
};

export const Toolbar = forwardRef<HTMLDivElement, Props>(function Toolbar({ paging, view, sort, onView, onSort }, ref) {
  const id = useId();
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const { from, to, total } = paging;
  const selectedSort = SORTS.find(([value]) => value === sort) ?? SORTS[0];

  useEffect(() => {
    if (!sortOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (!sortRef.current?.contains(event.target as Node)) setSortOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [sortOpen]);

  const moveSort = (current: Sort, direction: number) => {
    const index = SORTS.findIndex(([value]) => value === current);
    return SORTS[(index + direction + SORTS.length) % SORTS.length][0];
  };

  return (
    <div className="cat-tools" ref={ref}>
      <div className="cat-views" role="group" aria-label="Layout">
        <button type="button" aria-label="Grid view" aria-pressed={view === 'grid'} className={view === 'grid' ? 'on' : undefined} onClick={() => onView('grid')}>
          <GridIcon />
        </button>
        <button type="button" aria-label="List view" aria-pressed={view === 'list'} className={view === 'list' ? 'on' : undefined} onClick={() => onView('list')}>
          <ListIcon />
        </button>
      </div>
      <p className="cat-count" aria-live="polite" aria-atomic="true">
        {total === 0 ? (
          'No products match'
        ) : (
          <>
            Showing{' '}
            <b>
              {from}–{to}
            </b>{' '}
            of <b>{total}</b> product{total === 1 ? '' : 's'}
          </>
        )}
      </p>
      <div className="cat-sort" ref={sortRef}>
        <span>Sort by</span>
        <button
          id={`${id}-sort`}
          type="button"
          className="cat-sort-trigger"
          role="combobox"
          aria-label="Sort by"
          aria-haspopup="listbox"
          aria-expanded={sortOpen}
          aria-controls={`${id}-sort-options`}
          onClick={() => setSortOpen((open) => !open)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              if (!sortOpen) setSortOpen(true);
              else onSort(moveSort(sort, event.key === 'ArrowDown' ? 1 : -1));
            } else if (event.key === 'Escape') {
              setSortOpen(false);
            } else if (event.key === 'Home') {
              event.preventDefault();
              onSort(SORTS[0][0]);
            } else if (event.key === 'End') {
              event.preventDefault();
              onSort(SORTS[SORTS.length - 1][0]);
            }
          }}
        >
          <span>{selectedSort[1]}</span>
          <span className={`cat-sort-chevron${sortOpen ? ' open' : ''}`} aria-hidden="true" />
        </button>
        {sortOpen && (
          <div className="cat-sort-menu" id={`${id}-sort-options`} role="listbox" aria-label="Sort options">
            {SORTS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="option"
                aria-selected={sort === value}
                className={sort === value ? 'on' : undefined}
                onClick={() => {
                  onSort(value);
                  setSortOpen(false);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
