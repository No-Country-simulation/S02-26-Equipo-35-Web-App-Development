import React from 'react';
import { Terminal } from 'lucide-react';

export const LogTerminal = ({ logs, logContainerRef, t }) => {
    return (
        <div className="card h-100 border-0 shadow-lg rounded-5 overflow-hidden bg-dark text-light font-monospace" style={{ minHeight: '380px' }}>
            <div className="card-header bg-secondary bg-opacity-10 border-bottom border-base d-flex align-items-center justify-content-between px-4 py-3">
                <div className="d-flex align-items-center small text-secondary">
                    <Terminal className="w-4 h-4 me-2 text-primary" />
                    <span className="fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.05rem' }}>{t('processing.logs').toUpperCase()}</span>
                </div>
                <div className="d-flex gap-1">
                    <div className="bg-danger rounded-circle shadow-sm" style={{ width: '12px', height: '12px', opacity: 0.8 }}></div>
                    <div className="bg-warning rounded-circle shadow-sm" style={{ width: '12px', height: '12px', opacity: 0.8 }}></div>
                    <div className="bg-success rounded-circle shadow-sm" style={{ width: '12px', height: '12px', opacity: 0.8 }}></div>
                </div>
            </div>
            <div
                ref={logContainerRef}
                className="card-body p-4 overflow-auto scrollbar-dark"
                style={{ fontSize: '0.75rem', lineHeight: '1.6', background: '#0a0a0c' }}
            >
                {logs.map((log) => (
                    <div key={log.id} className="d-flex mb-3 animate-fade-in border-start border-primary border-opacity-10 ps-3">
                        <span className="text-secondary text-opacity-50 me-2" style={{ whiteSpace: 'nowrap', fontSize: '0.65rem' }}>{log.timestamp}</span>
                        <span className={`
              ${log.type === 'info' ? 'text-white-50' : ''}
              ${log.type === 'success' ? 'text-success fw-bold' : ''}
              ${log.type === 'warning' ? 'text-warning' : ''}
              ${log.type === 'error' ? 'text-danger' : ''}
            `}>
                            {log.type === 'info' && '➜ '}
                            {log.type === 'success' && '✓ '}
                            {log.message}
                        </span>
                    </div>
                ))}
                <div className="text-primary opacity-50 animate-pulse ps-3">█</div>
            </div>
        </div>
    );
};
