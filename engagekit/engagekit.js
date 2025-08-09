// dist/engagekit.js
console.log('EngageKit loaded!');

const EngageKit = {
  init: function(config) {
    console.log('EngageKit initialized with config:', config);
    
    // Highlighter functionality
    if (config.modules?.highlighter?.enabled) {
      console.log('Highlighter module enabled');
      
      // Simple highlighter implementation
      document.addEventListener('mouseup', function() {
        const selection = window.getSelection();
        if (selection.toString().length >= 3) {
          console.log('Text selected:', selection.toString());
          // Here you would add the highlighting logic
        }
      });
    }

    // Reading progress functionality
    if (config.modules?.readingProgress?.enabled) {
      console.log('Reading progress module enabled');
      // Add reading progress bar to the page
      const progressBar = document.createElement('div');
      progressBar.style.position = 'fixed';
      progressBar.style.top = '0';
      progressBar.style.left = '0';
      progressBar.style.height = '4px';
      progressBar.style.backgroundColor = '#4CAF50';
      progressBar.style.zIndex = '9999';
      progressBar.style.transition = 'width 0.1s';
      document.body.appendChild(progressBar);

      // Update progress on scroll
      window.addEventListener('scroll', function() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
      });
    }
  }
};

// Make it available globally
if (typeof window !== 'undefined') {
  window.EngageKit = EngageKit;
}