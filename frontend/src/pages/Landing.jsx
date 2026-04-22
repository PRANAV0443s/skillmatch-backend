import { Link } from 'react-router-dom'
import { Briefcase, Brain, BarChart3, Shield, ChevronRight, Sparkles } from 'lucide-react'
import './Landing.css'

const features = [
  { icon: <Brain size={28} />,         title: 'AI Resume Analysis',   desc: 'Our NLP engine extracts skills from your PDF and computes a precise match score against every job.' },
  { icon: <Briefcase size={28} />,        title: 'Smart Job Matching', desc: 'Instantly see which jobs best fit your skill set, ranked by compatibility.' },
  { icon: <BarChart3 size={28} />,     title: 'Application Tracking', desc: 'Follow every application from submitted → viewed → shortlisted in real time.' },
  { icon: <Shield size={28} />,        title: 'Secure & Private',     desc: 'JWT authentication and Cloudinary-encrypted file storage keep your data safe.' },
]

export default function Landing() {
  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="container hero-content">
          <div className="hero-badge">
            <Sparkles size={14} /> AI-Powered Job Matching
          </div>
          <h1 className="hero-title">
            Find Jobs That <span className="gradient-text">Match Your Skills</span>
          </h1>
          <p className="hero-subtitle">
            Upload your resume and let our AI score your fit — before you even apply.
            SkillMatch connects talent with opportunity intelligently.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free <ChevronRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><span className="stat-num">10K+</span><span>Jobs Listed</span></div>
            <div className="hero-stat-div" />
            <div className="hero-stat"><span className="stat-num">50K+</span><span>Candidates</span></div>
            <div className="hero-stat-div" />
            <div className="hero-stat"><span className="stat-num">92%</span><span>Match Accuracy</span></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Everything you need to land your dream job</h2>
          <div className="grid-2">
            {features.map((f) => (
              <div key={f.title} className="feature-card fade-up">
                <div className="feature-icon">{f.icon}</div>
                <div>
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container cta-inner">
          <h2>Ready to find your perfect match?</h2>
          <p>Join thousands of candidates already using SkillMatch.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Create Free Account <ChevronRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
