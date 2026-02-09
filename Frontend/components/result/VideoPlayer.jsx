import React from 'react';
import { Play, Pause } from 'lucide-react';

export const VideoPlayer = ({ isPlaying, onTogglePlay, shorts, t }) => {
    return (
        <div className="card border-0 shadow-sm rounded-5 flex-grow-1 bg-surface d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden border-base bg-glass">
            <div className="position-relative bg-black rounded-5 shadow-2xl overflow-hidden group" style={{ aspectRatio: '9/16', maxHeight: '100%', width: 'auto', border: '8px solid #222' }}>
                {/* Placeholder Video Background */}
                <img
                    src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop"
                    alt="Vertical Result"
                    className={`w-100 h-100 object-fit-cover transition-all duration-700 ${isPlaying ? 'opacity-100 scale-100' : 'opacity-60 scale-105'}`}
                />

                {/* Overlay Captions Simulation */}
                <div className="position-absolute bottom-0 start-0 end-0 mb-5 pb-5 px-4 text-center">
                    {shorts.slice(0, 1).map(s => (
                        <div key={s.shorts_id} className="d-inline-flex flex-column align-items-center mb-3">
                            <div className="d-inline-block bg-dark bg-opacity-80 backdrop-blur-md px-4 py-3 rounded-4 text-white fw-bold h5 shadow-lg border border-white border-opacity-20 animate-slide-up">
                                {s.text}
                            </div>
                            {s.status === 'ready' && (
                                <span className="badge rounded-pill bg-success mt-2 animate-fade-in shadow-sm" style={{ fontSize: '0.6rem' }}>READY</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Cover Selection Indicator (Mock) */}
                <div className="position-absolute top-0 start-0 m-4">
                    <div className="badge rounded-pill bg-primary bg-opacity-90 backdrop-blur px-3 py-2 border border-white border-opacity-20 shadow-lg d-flex align-items-center">
                        <div className="bg-white rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>
                        <span className="fw-bold tracking-tight" style={{ fontSize: '0.65rem' }}>COVER SELECTED</span>
                    </div>
                </div>

                {/* Controls Overlay */}
                <div className={`position-absolute inset-0 d-flex align-items-center justify-content-center bg-dark bg-opacity-30 transition-all duration-500 ${isPlaying ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'}`}>
                    <button
                        onClick={onTogglePlay}
                        className="btn btn-white btn-lg rounded-circle shadow-2xl p-4 d-flex align-items-center justify-content-center transition-all hover-scale"
                    >
                        {isPlaying ? <Pause className="w-8 h-8 text-dark" /> : <Play className="w-8 h-8 text-dark ms-1" fill="currentColor" />}
                    </button>
                </div>
            </div>

            {/* Player Controls Bar */}
            <div className="position-absolute bottom-0 start-0 end-0 m-4 p-3 rounded-pill bg-white bg-opacity-90 backdrop-blur shadow-lg border border-white d-flex align-items-center gap-3">
                <span className="small text-muted font-monospace fw-bold ps-2">00:02</span>
                <div className="progress flex-grow-1 rounded-pill bg-secondary bg-opacity-10" style={{ height: '6px' }}>
                    <div
                        className={`progress-bar bg-primary bg-gradient rounded-pill shadow-sm`}
                        style={{
                            width: isPlaying ? '100%' : '25%',
                            transition: isPlaying ? 'width 15s linear' : 'width 0.5s ease-out'
                        }}
                    ></div>
                </div>
                <span className="small text-muted font-monospace fw-bold pe-2">00:15</span>
                <div className="vr mx-1 opacity-10"></div>
                <button className="btn btn-link text-dark p-1 border-0 rounded-circle hover-bg-light" onClick={onTogglePlay}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" fill="currentColor" />}
                </button>
            </div>
        </div>
    );
};
