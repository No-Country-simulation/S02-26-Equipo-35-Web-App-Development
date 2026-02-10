import React from 'react';
import { Button } from '../Button';
import { Settings, Download, RotateCcw, Share2 } from 'lucide-react';

export const ShortsEditor = ({
    shorts,
    onTextChange,
    selectedShortId,
    onSelectShort,
    onExport,
    isExporting,
    onBack,
    onShare,
    t
}) => {
    return (
        <div className="card h-100 border-0 shadow-lg rounded-5 overflow-hidden d-flex flex-column bg-card border-base">
            {/* Editor Header */}
            <div className="card-header bg-transparent border-bottom border-base p-4 pt-xl-5 d-flex justify-content-between align-items-center">
                <div>
                    <h5 className="fw-bold text-base mb-1 tracking-tight">{t('result.editorTitle')}</h5>
                    <p className="small text-muted mb-0 fw-medium">{t('result.editorSubtitle')}</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-pill" icon={<Settings className="w-4 h-4" />}>
                    {t('result.styles')}
                </Button>
            </div>

            {/* Shorts List */}
            <div className="card-body p-4 p-xl-5 overflow-auto flex-grow-1 custom-scrollbar">
                <div className="d-flex flex-column gap-3">
                    {shorts.map((s) => (
                        <div
                            key={s.id}
                            className={`p-4 rounded-5 border-2 transition-all cursor-pointer ${selectedShortId === s.id
                                ? 'bg-primary bg-opacity-5 border-primary shadow-sm'
                                : 'bg-light bg-opacity-50 border-transparent hover-border-light shadow-none'
                                }`}
                            onClick={() => onSelectShort(s.id)}
                        >
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <span className="badge rounded-pill bg-surface text-primary border border-base shadow-sm font-monospace px-3 py-2" style={{ fontSize: '0.65rem' }}>
                                    {s.start_second} → {s.end_second}
                                </span>
                            </div>
                            <textarea
                                className="form-control form-control-sm border-0 bg-transparent p-0 shadow-none text-base fw-bold"
                                value={s.text}
                                onChange={(e) => onTextChange(s.id, e.target.value)}
                                rows={2}
                                style={{ resize: 'none', fontSize: '0.95rem', letterSpacing: '-0.01rem' }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Footer */}
            <div className="card-footer bg-transparent border-top border-base p-4 pt-3 pt-xl-4 pb-4 pb-xl-5">
                <Button
                    className="w-100 py-3 rounded-pill shadow-lg mb-3"
                    size="md"
                    variant="primary"
                    icon={!isExporting ? <Download className="w-5 h-5" /> : undefined}
                    onClick={onExport}
                    isLoading={isExporting}
                >
                    {isExporting ? t('result.export') + '...' : t('result.export')}
                </Button>
                <div className="row g-2">
                    <div className="col-6">
                        <Button variant="outline" className="w-100 rounded-pill py-2.5" onClick={onBack} icon={<RotateCcw className="w-4 h-4" />}>
                            {t('result.processNew')}
                        </Button>
                    </div>
                    <div className="col-6">
                        <Button variant="secondary" className="w-100 rounded-pill py-2.5" icon={<Share2 className="w-4 h-4" />} onClick={onShare}>
                            {t('result.share')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
