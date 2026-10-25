"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { BOOKS, getBookPages, type BookSpread } from "@/lib/portfolio-data";

type BookReaderProps = {
  bookIndex: number;
  photo: string;
  visible: boolean;
  onClose: () => void;
  onChoosePhoto: () => void;
};

type PageFlip = {
  from: BookSpread;
  direction: 1 | -1;
};

// Almanac theme: magenta accent, rule, ink, muted
const TAB_COLORS = [
  "oklch(45% 0.180 350)",   // chart magenta — primary accent
  "oklch(32% 0.018 240)",   // rule-2
  "oklch(24% 0.018 245)",   // ink-2
  "oklch(38% 0.016 245)",   // muted
  "oklch(37% 0.160 350)",   // accent-2
];

export default function BookReader({
  bookIndex,
  photo,
  visible,
  onClose,
  onChoosePhoto,
}: BookReaderProps) {
  const book = BOOKS[bookIndex];
  const pages = useMemo(
    () => getBookPages(bookIndex, photo, onChoosePhoto),
    [bookIndex, photo, onChoosePhoto],
  );
  const [pageIndex, setPageIndex] = useState(0);
  const [flip, setFlip] = useState<PageFlip | null>(null);

  useEffect(() => {
    if (!flip) return;
    const timeoutId = window.setTimeout(() => setFlip(null), 680);
    return () => window.clearTimeout(timeoutId);
  }, [flip]);

  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") goToPage(pageIndex + 1);
      if (event.key === "ArrowLeft") goToPage(pageIndex - 1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, pageIndex, flip, onClose]);

  function goToPage(nextIndex: number) {
    if (
      nextIndex < 0 ||
      nextIndex >= pages.length ||
      nextIndex === pageIndex ||
      flip !== null
    ) {
      return;
    }

    const direction: 1 | -1 = nextIndex > pageIndex ? 1 : -1;
    const from = pages[pageIndex];
    const shouldSkipAnimation =
      window.innerWidth < 700 || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setPageIndex(nextIndex);
    if (!shouldSkipAnimation) setFlip({ from, direction });
  }

  const currentSpread = pages[pageIndex] ?? pages[0];
  if (!book || !currentSpread) return null;

  const leftSpread = flip?.direction === 1 ? flip.from : currentSpread;
  const rightSpread = flip?.direction === -1 ? flip.from : currentSpread;
  const leafFront = flip?.direction === 1 ? flip.from.right : flip?.from.left;
  const leafBack = flip?.direction === 1 ? currentSpread.left : currentSpread.right;

  return (
    <div
      className={`reader-overlay${visible ? " on" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${book.title} book reader`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="reader-book-wrap">
        {book.tabs?.length ? (
          <div className="reader-tabs" aria-label={`${book.title} pages`}>
            {book.tabs.map((tab, index) => (
              <button
                className={`reader-tab${pageIndex === index ? " on" : ""}`}
                data-index={index}
                key={tab}
                type="button"
                style={
                  {
                    "--tab-color": TAB_COLORS[index % TAB_COLORS.length],
                    "--tab-rotation": `${index % 2 ? 1.5 : -1.5}deg`,
                  } as CSSProperties
                }
                onClick={() => goToPage(index)}
                disabled={flip !== null}
              >
                {tab}
              </button>
            ))}
          </div>
        ) : null}

        <div className="reader-spread">
          <div className="reader-page reader-page--left">{leftSpread.left}</div>
          <div className="reader-page reader-page--right">{rightSpread.right}</div>
          {flip ? (
            <div className={`page-leaf ${flip.direction === 1 ? "page-leaf--forward" : "page-leaf--back"}`}>
              <div className={`page-leaf-face reader-page ${flip.direction === 1 ? "reader-page--right" : "reader-page--left"}`}>
                {leafFront}
              </div>
              <div className={`page-leaf-face page-leaf-face--back reader-page ${flip.direction === 1 ? "reader-page--left" : "reader-page--right"}`}>
                {leafBack}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="reader-controls">
        <button
          type="button"
          onClick={() => goToPage(pageIndex - 1)}
          disabled={pageIndex === 0 || flip !== null}
          style={{ visibility: pages.length > 1 ? "visible" : "hidden" }}
        >
          Previous
        </button>
        <span className="reader-counter">
          {pages.length > 1 ? `Spread ${pageIndex + 1} of ${pages.length}` : ""}
        </span>
        <button
          type="button"
          onClick={() => goToPage(pageIndex + 1)}
          disabled={pageIndex === pages.length - 1 || flip !== null}
          style={{ visibility: pages.length > 1 ? "visible" : "hidden" }}
        >
          Next
        </button>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
