import React from 'react';
import { Clapperboard, User } from 'lucide-react';

export const MobileHeader = ({ onProfileClick }) => {
    return (
        <div className="d-md-none bg-primary bg-gradient border-bottom d-flex align-items-center justify-content-between px-4 py-3 sticky-top z-10 shadow-sm rounded-bottom-4 mb-4">
            <div className="d-flex align-items-center">
                <div className="bg-white p-1 rounded-circle me-3">
                    <Clapperboard className="w-5 h-5 text-primary" />
                </div>
                <span className="fw-bold text-white tracking-wider">VERTICAL AI</span>
            </div>
            <button onClick={onProfileClick} className="btn btn-light rounded-circle p-2 shadow-sm border-0">
                <User className="w-5 h-5 text-primary" />
            </button>
        </div>
    );
};
