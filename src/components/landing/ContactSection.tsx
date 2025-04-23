import React, { useState } from 'react';
import './ContactSection.css';

const initialForm = { name: '', email: '', message: '' };

const ContactSection: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would integrate with backend/email service
    setSubmitted(true);
    setForm(initialForm);
  };

  return (
    <section className="contact-section">
      <h2 className="contact-title">Contact Us</h2>
      <p className="contact-desc">Questions? Feedback? Reach out and our team will respond promptly.</p>
      <div className="contact-row">
        <form className="contact-form" onSubmit={handleSubmit}>
          <label htmlFor="contact-name">Name</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            autoComplete="name"
          />

          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />

          <label htmlFor="contact-message">Message</label>
          <textarea
            id="contact-message"
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            rows={4}
          />

          <button className="contact-submit" type="submit">Send Message</button>
          {submitted && <div className="contact-success">Thank you! We’ll be in touch soon.</div>}
        </form>
        <div className="contact-info">
          <div className="contact-info-block">
            <span className="contact-info-label">Email:</span>
            <a href="mailto:support@tamyla.com" className="contact-info-link">support@tamyla.com</a>
          </div>
          <div className="contact-info-block">
            <span className="contact-info-label">Live Chat:</span>
            <a href="#" className="contact-info-link">Chat with us</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
