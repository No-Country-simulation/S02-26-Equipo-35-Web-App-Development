import React, { useCallback, useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ProjectCard } from './common/ProjectCard';
import { getShorts } from '../services/shortService';
import { ShortCard } from './common/ShortCard';

export const ProjectsView = ({ projects }) => {
  const { t } = useApp();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [recentShorts, setRecentShorts] = useState([]);

  const filteredShorts = recentShorts.filter((s) => {
    const matchesFilter =
      filter === 'All' ||
      s.status === (filter === 'Completed' ? 'ready' : filter.toLowerCase());

    const matchesSearch = s.video_title
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Traigo los datos del shortServices
  useEffect(() => {
    const fetchData = async () => {
      const shorts = await getShorts();
      console.log('Shorts:', shorts);
      setRecentShorts(shorts);
    };

    fetchData();
  }, []);

  return (
    <div className="container-fluid p-0 animate-fade-in pb-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4 mb-5 pb-2">
        <div>
          <h1 className="h2 fw-bold text-base mb-1">{t('projects.title')}</h1>
          <p className="text-muted small mb-0">
            Manage and preview your recently created videos.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 w-100 w-md-auto">
          <div
            className="position-relative flex-grow-1"
            style={{ maxWidth: '350px' }}
          >
            <Search className="position-absolute start-0 top-50 translate-middle-y ms-3 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder={t('projects.search')}
              className="form-control ps-5 rounded-pill bg-card border-base shadow-sm py-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-outline-secondary rounded-circle shadow-sm d-flex align-items-center justify-content-center p-2">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills mb-5 pb-1 border-bottom border-light gap-2">
        {['All', 'Completed', 'Processing'].map((tab) => (
          <li className="nav-item" key={tab}>
            <button
              onClick={() => setFilter(tab)}
              className={`nav-link px-4 py-2 small fw-bold rounded-pill transition-all border border-transparent ${filter === tab ? 'bg-primary text-white shadow-sm border-primary' : 'text-muted hover-bg-light border-base'}`}
            >
              {t(`projects.filter${tab}`)}
            </button>
          </li>
        ))}
      </ul>

      {/* Grid */}
      {/* Grid */}
      {filteredShorts.length > 0 ? (
        <div className="row g-4 mb-5">
          {filteredShorts.map((short) => (
            <div key={short.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <ShortCard short={short} />
            </div>
          ))}
        </div>
      ) : (
        <div className="d-flex flex-column align-items-center justify-content-center py-5 my-5 text-muted bg-surface rounded-5 border border-dashed border-base">
          <div className="bg-card rounded-circle p-4 shadow-sm mb-4 border border-base">
            <Search className="w-12 h-12 text-primary opacity-25" />
          </div>
          <p className="fw-bold h5 text-base mb-1">No shorts found</p>
          <p className="small">{t('projects.empty')}</p>
        </div>
      )}
    </div>
  );
};
