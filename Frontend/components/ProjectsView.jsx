import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, Play, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const ProjectsView = ({ projects }) => {
  const { t } = useApp();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredProjects = projects.filter(p => {
    const matchesFilter = filter === 'All' || p.status === filter;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'Processing': return <Clock className="w-4 h-4 text-warning" />;
      case 'Failed': return <AlertCircle className="w-4 h-4 text-danger" />;
      default: return null;
    }
  };

  return (
    <div className="container-fluid p-0 animate-fade-in pb-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4 mb-5 pb-2">
        <div>
          <h1 className="h2 fw-bold text-base mb-1">{t('projects.title')}</h1>
          <p className="text-muted small mb-0">Manage and preview your recently created videos.</p>
        </div>
        <div className="d-flex align-items-center gap-2 w-100 w-md-auto">
          <div className="position-relative flex-grow-1" style={{ maxWidth: '350px' }}>
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
      {filteredProjects.length > 0 ? (
        <div className="row g-4 mb-5">
          {filteredProjects.map((project) => (
            <div key={project.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div className="card h-100 border-0 shadow-sm rounded-5 overflow-hidden project-card transition-all hover-translate-y group bg-card border-base">
                <div className="position-relative bg-light transition-opacity overflow-hidden" style={{ aspectRatio: '9/16' }}>
                  <img src={project.thumbnailUrl} alt={project.title} className="w-100 h-100 object-fit-cover transition-all group-hover-scale-110" />
                  <div className="position-absolute inset-0 d-flex align-items-center justify-content-center bg-dark bg-opacity-40 opacity-0 group-hover-opacity-100 transition-all cursor-pointer">
                    <div className="bg-glass rounded-circle p-4 animate-scale-in border-0">
                      <Play className="w-10 h-10 text-white" fill="currentColor" />
                    </div>
                  </div>
                  <div className="position-absolute top-0 end-0 m-3 z-1">
                    <span className={`badge rounded-pill bg-dark bg-opacity-80 backdrop-blur text-white px-3 py-2 fw-bold text-uppercase border border-white border-opacity-10 ${project.status === 'Processing' ? 'text-warning' : ''}`} style={{ fontSize: '0.6rem', letterSpacing: '0.05rem' }}>
                      {t(`dashboard.status.${project.status}`)}
                    </span>
                  </div>
                </div>
                <div className="card-body p-4 pt-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold text-base text-truncate mb-0 pe-2" style={{ letterSpacing: '-0.01rem' }}>{project.title}</h6>
                    <button className="btn btn-link text-muted p-1 border-0 rounded-circle hover-bg-light">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="d-flex align-items-center justify-content-between pt-2">
                    <div className="d-flex align-items-center small text-muted">
                      <div className="p-1 rounded-circle bg-light me-2">
                        {getStatusIcon(project.status)}
                      </div>
                      <span className="fw-medium" style={{ fontSize: '0.75rem' }}>{project.date}</span>
                    </div>
                    <div className="small font-monospace text-muted opacity-50" style={{ fontSize: '0.65rem' }}>
                      ID: {project.id.split('-')[0]}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="d-flex flex-column align-items-center justify-content-center py-5 my-5 text-muted bg-surface rounded-5 border border-dashed border-base">
          <div className="bg-card rounded-circle p-4 shadow-sm mb-4 border border-base">
            <Search className="w-12 h-12 text-primary opacity-25" />
          </div>
          <p className="fw-bold h5 text-base mb-1">No videos found</p>
          <p className="small">{t('projects.empty')}</p>
        </div>
      )}
    </div>
  );
};