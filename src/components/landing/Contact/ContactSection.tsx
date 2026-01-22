import React, { useState } from 'react';
import { emailApi } from '../../../api/email';
import './ContactSection.css';

const initialForm = { name: '', email: '', message: '' };

const ContactSection: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await emailApi.sendContactEmail({
        name: form.name,
        email: form.email,
        subject: 'Contact Form Submission - Trading Portal',
        message: form.message
      });
      if (result.success) {
        setSubmitted(true);
        setForm(initialForm);
      } else {
        setError(result.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setError('Failed to send message. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="contact-section">
      <div className="landing-section-content">
        <h2 className="contact-title">Contact Us</h2>
        {submitted ? (
          <div className="contact-success">Thank you! Your message has been sent.</div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-row">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <textarea
              name="message"
              placeholder="Your Message"
              value={form.message}
              onChange={handleChange}
              required
            />
            {error && <div className="contact-error">{error}</div>}
            <button type="submit" className="contact-submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default ContactSection;
