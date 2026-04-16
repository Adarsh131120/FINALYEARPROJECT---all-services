// frontend/src/pages/AboutPage.jsx

import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1>About Malware Detection System</h1>
        
        <section className="about-section">
          <h2>Project Overview</h2>
          <p>
            This is a B.Tech final year project that implements an AI-powered 
            malware detection and classification system using machine learning 
            and behavioral analysis.
          </p>
        </section>
        
        <section className="about-section">
          <h2>How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Upload File</h3>
              <p>Upload a suspicious executable file for analysis</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Sandbox Execution</h3>
              <p>File is executed in an isolated Cuckoo Sandbox environment</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>API Extraction</h3>
              <p>Runtime API call sequences are extracted and preprocessed</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>ML Classification</h3>
              <p>Machine learning models classify the malware family</p>
            </div>
          </div>
        </section>
        
        <section className="about-section">
          <h2>Technology Stack</h2>
          <div className="tech-grid">
            <div className="tech-item">
              <h4>Frontend</h4>
              <p>React, React Router, Recharts</p>
            </div>
            <div className="tech-item">
              <h4>Backend</h4>
              <p>Node.js, Express, MongoDB, Redis</p>
            </div>
            <div className="tech-item">
              <h4>ML Service</h4>
              <p>Python, FastAPI, scikit-learn, XGBoost</p>
            </div>
            <div className="tech-item">
              <h4>Sandbox</h4>
              <p>Cuckoo Sandbox, VirtualBox</p>
            </div>
          </div>
        </section>
        
        <section className="about-section">
          <h2>Team Members</h2>
          <div className="team-list">
            <p><strong>Adarsh Tiwari</strong> - B122006</p>
            <p><strong>Liron Sarangi</strong> - B122065</p>
            <p><strong>Anushka Joshi</strong> - B122022</p>
          </div>
          <p className="supervisor">
            <strong>Supervisor:</strong> Dr. Sabyasachi Patra
          </p>
          <p className="institution">
            International Institute of Information Technology, Bhubaneswar
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;