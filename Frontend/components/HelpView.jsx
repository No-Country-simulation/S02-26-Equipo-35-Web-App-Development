import React, { useState } from 'react';
import { MessageCircle, FileText, ExternalLink } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const HelpView = () => {
  const { t } = useApp();
  const [activeIndex, setActiveIndex] = useState(-1);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? -1 : index);
  };

  return (
    <div className="container py-4 animate-fade-in pb-5" style={{ maxWidth: '850px' }}>
      <div className="text-center mb-5">
        <h1 className="display-6 fw-bold text-base mb-3">{t('help.title')}</h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
          We're here to help you create amazing vertical videos with ease.
        </p>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-6">
          <div className="card h-100 border-0 shadow-sm rounded-5 bg-primary bg-gradient text-white cursor-pointer transition-all hover-translate-y">
            <div className="card-body p-4 d-flex flex-column">
              <div className="p-3 bg-white bg-opacity-20 rounded-circle d-inline-flex mb-4 align-self-start">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="h4 fw-bold mb-2">{t('help.contact')}</h3>
              <p className="small mb-4 text-white text-opacity-75">Chat with our support team directly for any issues.</p>
              <div className="d-flex align-items-center small fw-bold mt-auto pt-3">
                <span className="border-bottom border-2 border-white border-opacity-25 pb-1">Start Chat</span>
                <ExternalLink className="w-4 h-4 ms-2" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100 border-0 shadow-sm rounded-5 bg-card cursor-pointer transition-all hover-translate-y border border-base">
            <div className="card-body p-4 d-flex flex-column">
              <div className="p-3 bg-primary bg-opacity-10 rounded-circle d-inline-flex mb-4 align-self-start">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h3 className="h4 fw-bold text-base mb-2">{t('help.docs')}</h3>
              <p className="small mb-4 text-muted">Read detailed guides on how to use all features effectively.</p>
              <div className="d-flex align-items-center small fw-bold text-primary mt-auto pt-3">
                <span className="border-bottom border-2 border-primary border-opacity-10 pb-1">Read Documentation</span>
                <ExternalLink className="w-4 h-4 ms-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-base shadow-sm rounded-5 overflow-hidden bg-card">
        <div className="card-header bg-transparent border-bottom border-base p-4">
          <h2 className="h4 fw-bold text-base mb-0">{t('help.faq')}</h2>
        </div>
        <div className="card-body p-4 pt-0">
          <div className="accordion accordion-flush" id="faqAccordion">
            <div className="accordion-item border-base border-start-0 border-end-0 border-top-0 rounded-0 mb-0 overflow-hidden shadow-none bg-transparent">
              <h2 className="accordion-header">
                <button
                  className={`accordion-button fw-bold text-base bg-transparent shadow-none ${activeIndex !== 0 ? 'collapsed' : ''}`}
                  type="button"
                  onClick={() => toggleAccordion(0)}
                >
                  {t('help.q1')}
                </button>
              </h2>
              <div className={`accordion-collapse collapse ${activeIndex === 0 ? 'show' : ''}`}>
                <div className="accordion-body small text-muted lh-lg bg-surface">
                  {t('help.a1')}
                </div>
              </div>
            </div>

            <div className="accordion-item border-0 rounded-0 mb-0 overflow-hidden shadow-none bg-transparent">
              <h2 className="accordion-header">
                <button
                  className={`accordion-button fw-bold text-base bg-transparent shadow-none ${activeIndex !== 1 ? 'collapsed' : ''}`}
                  type="button"
                  onClick={() => toggleAccordion(1)}
                >
                  {t('help.q2')}
                </button>
              </h2>
              <div className={`accordion-collapse collapse ${activeIndex === 1 ? 'show' : ''}`}>
                <div className="accordion-body small text-muted lh-lg bg-surface">
                  {t('help.a2')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};