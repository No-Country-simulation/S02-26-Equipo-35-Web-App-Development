import React from 'react';
import { Smartphone, Settings } from 'lucide-react';

export const VideoConfig = ({ t }) => {
    return (
        <div className="card h-100 border-0 shadow-sm rounded-5 overflow-hidden bg-card">
            <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0">
                <h5 className="fw-bold text-base d-flex align-items-center mb-0">
                    <Smartphone className="w-5 h-5 me-2 text-primary" />
                    {t('settings.videoDefaults')}
                </h5>
            </div>
            <div className="card-body p-4 d-flex flex-column">
                <div className="mb-4">
                    <label className="form-label small fw-bold text-muted mb-2">{t('settings.aspectRatio')}</label>
                    <div className="position-relative">
                        <select className="form-select border border-secondary-subtle bg-light rounded-4 py-2 ps-3 shadow-none">
                            <option>9:16 (TikTok, Reels, Shorts)</option>
                            <option>1:1 (Square)</option>
                            <option>4:5 (Instagram Feed)</option>
                        </select>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="form-label small fw-bold text-muted mb-2">{t('settings.quality')}</label>
                    <div className="position-relative">
                        <select className="form-select border border-secondary-subtle bg-light rounded-4 py-2 ps-3 shadow-none">
                            <option>1080p HD (Recommended)</option>
                            <option>4K Ultra HD</option>
                            <option>720p Fast Render</option>
                        </select>
                    </div>
                </div>

                <div className="mt-auto">
                    <div className="p-3 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-10 shadow-sm">
                        <p className="small text-primary fw-medium mb-0 d-flex align-items-start">
                            <Settings className="w-4 h-4 me-2 mt-1 flex-shrink-0" />
                            <span>These settings will be applied to your next upload for consistent branding.</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
