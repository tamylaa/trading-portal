import React from 'react';
import './AboutSection.css';

const team = [
  {
    name: 'Amit Verma',
    role: 'Founder & CEO',
    avatar: '/assets/avatars/amit.jpg'
  },
  {
    name: 'Priya Shah',
    role: 'Chief Product Officer',
    avatar: '/assets/avatars/priya.jpg'
  },
  {
    name: 'James Lee',
    role: 'Head of Engineering',
    avatar: '/assets/avatars/james.jpg'
  }
];

const AboutSection: React.FC = () => (
  <section className="about-section">
    <h2 className="about-title">Our Mission</h2>
    <p className="about-mission">
      At Tamyla, we believe that modern trading should be accessible, secure, and empowering for everyone. Our mission is to help businesses and professionals thrive by providing fast, reliable, and insightful trading solutions—built on trust, innovation, and support.
    </p>
    <h3 className="about-team-title">Meet the Team</h3>
    <div className="about-team-row">
      {team.map((member, idx) => (
        <div className="about-team-card" key={idx}>
          <div className="about-team-avatar">
            <img src={member.avatar} alt={member.name + ' photo'} />
          </div>
          <div className="about-team-info">
            <span className="about-team-name">{member.name}</span>
            <span className="about-team-role">{member.role}</span>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default AboutSection;
