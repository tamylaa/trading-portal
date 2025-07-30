import React, { useState } from 'react';
import { emailApi } from '../../api/email';
import './ContactSection.css';

const initialForm = { name: '', email: '', message: '' };

const ContactSection: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send email using the email service
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
      console.error('Contact form error:', err);
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
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
            disabled={loading}
          />

          <label htmlFor="contact-message">Message</label>
          <textarea
            id="contact-message"
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            rows={4}
            disabled={loading}
          />

          <button 
            className="contact-submit" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
          
          {submitted && (
            <div className="contact-success">
              Thank you! We'll be in touch soon.
            </div>
          )}
          
          {error && (
            <div className="contact-error">
              {error}
            </div>
          )}
        </form>
        <div className="contact-info">
          <div className="contact-info-block">
            <span className="contact-info-label">Email:</span>
            <a href="mailto:support@tamyla.com" className="contact-info-link">support@tamyla.com</a>
          </div>
          <div className="contact-info-block">
            <span className="contact-info-label">Live Chat:</span>
            {/* Changed from anchor to button for accessibility */}
            <button type="button" className="contact-info-link" aria-label="Chat with us">Chat with us</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
