import React from 'react';
import './footer.css';

const Footer: React.FC = () => {
    return (
        <footer id="footer-container" className="footer">
            <div className="footer-container">
                <div className="footer-column">
                    <h3>Company</h3>
                    <ul>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/services">Our Services</a></li>
                        <li><a href="/careers">Careers</a></li>
                        <li><a href="/terms">Terms & Conditions</a></li>
                        <li><a href="/privacy">Privacy Policy</a></li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h3>Support</h3>
                    <ul>
                        <li><a href="/contact">Contact Us</a></li>
                        <li><a href="/faq">FAQ</a></li>
                        <li><a href="/resources">Trading Resources</a></li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h3>Connect</h3>
                    <ul className="social-links">
                        <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i> LinkedIn</a></li>
                        <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i> Twitter</a></li>
                        <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i> Facebook</a></li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h3>Contact Info</h3>
                    <p><i className="far fa-envelope"></i> <a href="mailto:trading@tamyla.com">Tamyla Trading Ventures LLP</a></p>
                    <p><i className="fas fa-phone"></i> +91 8248030554</p>
                    <p><i className="fas fa-map-marker-alt"></i> Wework CyberSpace, Guindy, Chennai</p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Tamyla Trading Ventures LLP. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;