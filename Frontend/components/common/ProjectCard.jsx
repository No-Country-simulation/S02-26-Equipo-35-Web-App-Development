import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Play, MoreHorizontal } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const ProjectCard = ({ project, variant = 'grid' }) => {
    const { t } = useApp();

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ready': return <CheckCircle2 className="w-4 h-4 text-success" />;
            case 'processing': return <Clock className="w-4 h-4 text-warning" />;
            case 'failed': return <AlertCircle className="w-4 h-4 text-danger" />;
            default: return null;
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            'ready': 'Completed',
            'processing': 'Processing',
            'failed': 'Failed'
        };
        return t(`dashboard.status.${statusMap[status] || status}`);
    };

    if (variant === 'row') {
        return (
            <div className="card h-100 border-0 shadow-sm rounded-5 overflow-hidden project-card transition-all hover-translate-y">
                <div className="card-body p-3">
                    <div className="d-flex align-items-center">
                        <div className="position-relative bg-secondary bg-opacity-10 rounded-4 overflow-hidden shadow-sm" style={{ width: '85px', height: '115px' }}>
                            <img src={project.file_url} alt={project.file_name} className="w-100 h-100 object-fit-cover opacity-90 transition-all" />
                            <div className="position-absolute inset-0 d-flex align-items-center justify-content-center bg-primary bg-opacity-25 opacity-0 project-play transition-all">
                                <div className="bg-white rounded-circle p-2 shadow-sm">
                                    <Play className="w-4 h-4 text-primary" fill="currentColor" />
                                </div>
                            </div>
                        </div>
                        <div className="ms-3 flex-grow-1 overflow-hidden">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                                <h6 className="text-dark fw-bold mb-0 text-truncate pe-2">{project.file_name}</h6>
                                <button className="btn btn-link text-muted p-0 border-0 flex-shrink-0">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="small text-muted mb-2 d-flex align-items-center">
                                <Clock className="w-3 h-3 me-1" />
                                {project.create_at}
                            </p>
                            <div className="d-flex align-items-center pt-2">
                                <div className={`p-1 rounded-circle me-2 d-flex align-items-center ${project.status === 'ready' ? 'bg-success bg-opacity-10 text-success' :
                                    project.status === 'processing' ? 'bg-warning bg-opacity-10 text-warning' : 'bg-danger bg-opacity-10 text-danger'
                                    }`}>
                                    {getStatusIcon(project.status)}
                                </div>
                                <span className={`small fw-bold ${project.status === 'ready' ? 'text-success' :
                                    project.status === 'processing' ? 'text-warning' : 'text-danger'
                                    }`}>
                                    {getStatusText(project.status)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default Grid variant (for ProjectsView)
    return (
        <div className="card h-100 border-0 shadow-sm rounded-5 overflow-hidden project-card transition-all hover-translate-y group bg-card border-base">
            <div className="position-relative bg-light transition-opacity overflow-hidden" style={{ aspectRatio: '9/16' }}>
                <img src={project.file_url} alt={project.file_name} className="w-100 h-100 object-fit-cover transition-all group-hover-scale-110" />
                <div className="position-absolute inset-0 d-flex align-items-center justify-content-center bg-dark bg-opacity-40 opacity-0 group-hover-opacity-100 transition-all cursor-pointer">
                    <div className="bg-glass rounded-circle p-4 animate-scale-in border-0">
                        <Play className="w-10 h-10 text-white" fill="currentColor" />
                    </div>
                </div>
                <div className="position-absolute top-0 end-0 m-3 z-1">
                    <span className={`badge rounded-pill bg-dark bg-opacity-80 backdrop-blur text-white px-3 py-2 fw-bold text-uppercase border border-white border-opacity-10 ${project.status === 'processing' ? 'text-warning' : ''}`} style={{ fontSize: '0.6rem', letterSpacing: '0.05rem' }}>
                        {getStatusText(project.status)}
                    </span>
                </div>
            </div>
            <div className="card-body p-4 pt-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold text-base text-truncate mb-0 pe-2" style={{ letterSpacing: '-0.01rem' }}>{project.file_name}</h6>
                    <button className="btn btn-link text-muted p-1 border-0 rounded-circle hover-bg-light">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
                <div className="d-flex align-items-center justify-content-between pt-2">
                    <div className="d-flex align-items-center small text-muted">
                        <div className="p-1 rounded-circle bg-light me-2">
                            {getStatusIcon(project.status)}
                        </div>
                        <span className="fw-medium" style={{ fontSize: '0.75rem' }}>{project.create_at}</span>
                    </div>
                    <div className="small font-monospace text-muted opacity-50" style={{ fontSize: '0.65rem' }}>
                        ID: {project.id.split('-')[0]}
                    </div>
                </div>
            </div>
        </div>
    );
};
