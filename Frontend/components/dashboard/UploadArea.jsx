import React from 'react';
import { UploadCloud } from 'lucide-react';
import { Button } from '../Button';

export const UploadArea = ({ isDragging, onDragOver, onDragLeave, onDrop, onSelectFile, t }) => {
    return (
        <div
            className={`card h-100 border-dashed border-2 rounded-5 transition-all overflow-hidden ${isDragging ? 'border-primary bg-primary bg-opacity-10 scale-102' : 'bg-card shadow-sm border-base'}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
            style={{ cursor: 'pointer', minHeight: '320px' }}
        >
            <input
                id="file-upload"
                type="file"
                className="d-none"
                accept="video/*"
                onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                        onSelectFile(e.target.files[0]);
                    }
                }}
            />

            <div className="card-body d-flex flex-column align-items-center justify-content-center text-center p-5">
                <div className="p-4 rounded-circle bg-primary bg-opacity-10 shadow-sm mb-4 animate-bounce-subtle">
                    <UploadCloud className="w-10 h-10 text-primary" />
                </div>
                <h3 className="h5 fw-bold text-dark mb-2">{t('dashboard.dragText')}</h3>
                <p className="small text-muted mb-4 px-lg-5">{t('dashboard.formats')}</p>
                <Button variant="primary" size="lg" className="px-5 rounded-pill shadow-sm">
                    {t('dashboard.selectBtn')}
                </Button>
            </div>
        </div>
    );
};
