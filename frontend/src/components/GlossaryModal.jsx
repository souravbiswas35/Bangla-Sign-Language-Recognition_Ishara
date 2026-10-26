import React, { useState, useMemo } from 'react';
import { SIGN_CLASSES } from '../data/classes';
import { speakText } from '../utils/speech';
import SignVideoModal from './SignVideoModal';
import { IconBookOpen, IconSearch, IconX, IconVolume, IconPlay, IconVideo } from './Icons';

export default function GlossaryModal({ isOpen, onClose }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeVideoSign, setActiveVideoSign] = useState(null);

  const categories = useMemo(() => {
    const cats = new Set(SIGN_CLASSES.map((c) => c.category));
    return ['All', ...Array.from(cats).sort()];
  }, []);

  const filteredClasses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return SIGN_CLASSES.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchesQuery =
        !query ||
        item.label.toLowerCase().includes(query) ||
        item.bangla.includes(query) ||
        item.english.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [search, selectedCategory]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h2 className="modal-title">
                  <IconBookOpen size={20} />
                  <span>100-Class Bangla Sign Language Dictionary</span>
                </h2>
                <span className="badge badge--primary dictionary-video-badge">
                  <IconVideo size={12} />
                  <span>100 Videos Ready</span>
                </span>
              </div>
              <p className="modal-subtitle">
                Click on any sign or video name to pop up and watch the demonstration sign video
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="btn btn--sm btn--ghost"
              style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}
              title="Close dictionary"
            >
              <IconX size={18} />
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="modal-search-bar">
            <div className="search-input-wrapper">
              <IconSearch size={18} />
              <input
                type="text"
                placeholder="Search signs by Bangla (e.g. ধন্যবাদ), Romanized (e.g. Dhonnobad), or English..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
                autoFocus
              />
            </div>

            {/* Category filter pills */}
            <div className="category-chips">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-chip ${
                    selectedCategory === cat ? 'category-chip--active' : ''
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Classes List Grid */}
          <div className="modal-content-grid">
            {filteredClasses.length > 0 ? (
              filteredClasses.map((item) => (
                <div
                  key={item.id}
                  className="class-card class-card--clickable"
                  onClick={() => setActiveVideoSign(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveVideoSign(item);
                    }
                  }}
                  title={`Click to pop up sign video for ${item.label} (${item.bangla})`}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="class-card__bengali">
                        {item.bangla}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakText(item.bangla, 'bn-BD');
                        }}
                        className="btn btn--sm btn--ghost"
                        style={{ padding: '0.25rem', borderRadius: '50%', color: 'var(--accent-primary)' }}
                        title="Pronounce in Bangla"
                      >
                        <IconVolume size={16} />
                      </button>
                    </div>

                    <div className="class-card__roman-row">
                      <span className="class-card__roman">{item.label}</span>
                      <span className="class-card__video-indicator" title="Click to pop up demo video">
                        <IconPlay size={10} />
                        <span>Sign Video</span>
                      </span>
                    </div>

                    <div className="class-card__english">
                      "{item.english}"
                    </div>
                  </div>

                  <div className="class-card__footer">
                    <span className="category-pill" style={{ margin: 0 }}>
                      {item.category}
                    </span>
                    <button
                      type="button"
                      className="class-card__watch-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveVideoSign(item);
                      }}
                      title={`Pop up video for ${item.label}`}
                    >
                      <IconPlay size={11} />
                      <span>Watch Video</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '3rem',
                  color: 'var(--text-muted)',
                }}
              >
                No matching signs found. Try another search keyword.
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '0.85rem 1.75rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              background: 'var(--bg-card)',
            }}
          >
            <span>Showing {filteredClasses.length} of {SIGN_CLASSES.length} vocabulary classes · Click any class or video name to pop up video</span>
            <button type="button" className="btn btn--sm btn--secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Pop-up Video Modal for corresponding sign video */}
      <SignVideoModal
        signClass={activeVideoSign}
        onClose={() => setActiveVideoSign(null)}
        onSelectSign={setActiveVideoSign}
        allClasses={SIGN_CLASSES}
      />
    </>
  );
}
