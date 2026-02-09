import React from 'react';
import { Layout, Clapperboard, HelpCircle, LogOut, Sun, Moon } from 'lucide-react';

export const Sidebar = ({
    currentScreen,
    onNavigate,
    language,
    setLanguage,
    theme,
    toggleTheme,
    t
}) => {
    return (
        <nav id="sidebar" className="col-md-3 col-lg-2 d-md-block bg-white sidebar shadow-sm px-0 h-100 bg-glass position-fixed top-0 start-0 z-3 p-0">
            <div className="d-flex flex-column h-100">
                {/* Logo area */}
                <div className="py-4 px-4 mb-3 border-bottom d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-4 shadow-sm border border-primary border-opacity-10">
                        <Clapperboard className="w-5 h-5 text-primary" />
                    </div>
                    <span className="ms-3 h6 mb-0 fw-bold tracking-wider text-gradient">VERTICAL AI</span>
                </div>

                <div className="flex-grow-1 px-3 py-3 overflow-auto">
                    <NavItem
                        icon={<Layout />}
                        label={t('sidebar.dashboard')}
                        active={currentScreen === 'dashboard'}
                        onClick={() => onNavigate('dashboard')}
                    />
                    <NavItem
                        icon={<Clapperboard />}
                        label={t('sidebar.projects')}
                        active={currentScreen === 'projects'}
                        onClick={() => onNavigate('projects')}
                    />
                    <NavItem
                        icon={<HelpCircle />}
                        label={t('sidebar.help')}
                        active={currentScreen === 'help'}
                        onClick={() => onNavigate('help')}
                    />
                </div>

                {/* Footer Sidebar Actions */}
                <div className="px-3 py-4 border-top mt-auto bg-surface">
                    {/* Language Selection */}
                    <div className="px-3 pb-3">
                        <div className="d-flex align-items-center justify-content-between">
                            <span className="small fw-bold text-muted text-uppercase tracking-wider" style={{ fontSize: '0.65rem' }}>Language</span>
                            <div className="btn-group p-1 bg-surface border border-base rounded-pill shadow-sm">
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`btn btn-sm px-3 rounded-pill border-0 transition-all fw-bold ${language === 'en' ? 'btn-primary text-white shadow-sm' : 'text-muted'}`}
                                    style={{ fontSize: '0.7rem' }}
                                >
                                    EN
                                </button>
                                <button
                                    onClick={() => setLanguage('es')}
                                    className={`btn btn-sm px-3 rounded-pill border-0 transition-all fw-bold ${language === 'es' ? 'btn-primary text-white shadow-sm' : 'text-muted'}`}
                                    style={{ fontSize: '0.7rem' }}
                                >
                                    ES
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Theme & User Profile */}
                    <div className="px-1">
                        <button
                            onClick={toggleTheme}
                            className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-between px-3 py-2 rounded-4 border-dashed mb-3 transition-all hover-translate-y shadow-sm bg-card border-base"
                        >
                            <div className="d-flex align-items-center fw-bold small">
                                {theme === 'dark' ? <Moon className="w-4 h-4 me-2 text-primary" /> : <Sun className="w-4 h-4 me-2 text-warning" />}
                                {t('sidebar.theme')}
                            </div>
                            <span className={`badge rounded-pill px-2 py-1 text-uppercase ${theme === 'dark' ? 'bg-primary' : 'bg-dark'}`} style={{ fontSize: '0.55rem' }}>
                                {theme}
                            </span>
                        </button>

                        <button
                            onClick={() => onNavigate('profile')}
                            className={`btn d-flex align-items-center w-100 px-3 py-3 rounded-4 border border-secondary-subtle transition-all bg-card shadow-sm ${currentScreen === 'profile' ? 'border-primary' : ''}`}
                        >
                            <div className="rounded-circle bg-primary bg-gradient d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{ width: '36px', height: '36px', fontSize: '0.8rem' }}>
                                JD
                            </div>
                            <div className="ms-3 text-start flex-grow-1 overflow-hidden">
                                <div className="small fw-bold text-base text-truncate">John Doe</div>
                                <div className="text-muted" style={{ fontSize: '0.65rem' }}>john.doe@example.com</div>
                            </div>
                            <LogOut className="w-4 h-4 text-muted ms-2 opacity-50" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

function NavItem({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`btn d-flex align-items-center w-100 px-4 py-3 rounded-4 transition-all mb-1 border-0 text-start group ${active ? 'btn-primary text-white shadow shadow-primary-subtle' : 'btn-link text-muted text-decoration-none hover-bg-light fw-bold small'}`}
        >
            <span className={`me-3 d-flex align-items-center transition-transform ${active ? 'scale-110' : 'group-hover-translate-x'}`}>
                {React.cloneElement(icon, { size: 18, strokeWidth: active ? 2.5 : 2 })}
            </span>
            <span>{label}</span>
        </button>
    );
}
