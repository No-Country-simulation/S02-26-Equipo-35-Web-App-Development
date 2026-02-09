import React from 'react';
import { Video, Check } from 'lucide-react';

export const VisualPreview = ({ t }) => {
    return (
        <div className="card h-100 border-0 shadow-sm rounded-5 overflow-hidden bg-surface position-relative" style={{ minHeight: '380px' }}>
            <div className="position-absolute inset-0 opacity-25" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(100%)' }}></div>
            <div className="card-body d-flex flex-column align-items-center justify-content-center position-relative z-1">
                {/* Smart Crop Overlay Simulation */}
                <div className="position-relative bg-dark bg-opacity-75 border-primary border-4 shadow-lg rounded-4 overflow-hidden d-flex align-items-center justify-content-center" style={{ width: '130px', height: '230px' }}>
                    <Video className="w-8 h-8 text-primary text-opacity-75" />
                    <div className="position-absolute top-0 end-0 m-3 d-flex gap-1">
                        <div className="badge bg-danger rounded-circle p-1 animate-pulse" style={{ width: '8px', height: '8px' }}></div>
                    </div>
                    <div className="position-absolute bottom-0 start-0 w-100 bg-primary bg-opacity-20 py-1 text-center" style={{ fontSize: '0.6rem' }}>
                        <span className="text-white fw-bold tracking-widest">AI CROP</span>
                    </div>
                </div>
                <p className="mt-4 small fw-bold text-primary d-flex align-items-center mb-0 bg-card px-3 py-1 rounded-pill shadow-sm border border-base">
                    <Check className="w-4 h-4 me-2" /> {t('processing.cropActive')}
                </p>
            </div>
        </div>
    );
};
