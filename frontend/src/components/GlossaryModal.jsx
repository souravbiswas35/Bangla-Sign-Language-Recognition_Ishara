import React, { useState, useMemo } from 'react';
import { SIGN_CLASSES } from '../data/classes';
import { speakText } from '../utils/speech';
import { IconBookOpen, IconSearch, IconX, IconVolume } from './Icons';

export default function GlossaryModal({ isOpen, onClose }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              <IconBookOpen size={20} />
              <span>100-Class Bangla Sign Language Dictionary</span>
            </h2>
            <p className="modal-subtitle">
              Browse the complete vocabulary recognized by the AI Vision Transformer & RNN models
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
              <div key={item.id} className="class-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="class-card__bengali">
                      {item.bangla}
                    </span>
                    <button
                      type="button"
                      onClick={() => speakText(item.bangla, 'bn-BD')}
                      className="btn btn--sm btn--ghost"
                      style={{ padding: '0.25rem', borderRadius: '50%', color: 'var(--accent-primary)' }}
                      title="Pronounce in Bangla"
                    >
                      <IconVolume size={16} />
                    </button>
                  </div>
                  <div className="class-card__roman">
                    {item.label}
                  </div>
                  <div className="class-card__english">
                    "{item.english}"
                  </div>
                </div>

                <div className="class-card__footer">
                  <span className="category-pill" style={{ margin: 0 }}>
                    {item.category}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    ID #{item.id}
                  </span>
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
          <span>Showing {filteredClasses.length} of {SIGN_CLASSES.length} vocabulary classes</span>
          <button type="button" className="btn btn--sm btn--secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
