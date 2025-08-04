// Standalone Content Manager Web Component
// No external dependencies - pure Web Components API

class TamylaContentManager extends HTMLElement {
  constructor() {
    super();
    
    // Create shadow DOM
    this.attachShadow({ mode: 'open' });
    
    // Initialize properties
    this.apiBase = this.getAttribute('api-base') || '/api/content';
    this.selectionMode = this.hasAttribute('selection-mode');
    this.showUpload = this.hasAttribute('show-upload') !== false;
    this.showGallery = this.hasAttribute('show-gallery') !== false;
    this.showSearch = this.hasAttribute('show-search') !== false;
    this.maxFileSize = parseInt(this.getAttribute('max-file-size')) || 25 * 1024 * 1024;
    
    // Internal state
    this.content = [];
    this.selectedContent = new Set();
    this.isLoading = false;
    this.searchQuery = '';
    this.currentFilter = 'all';
    
    // Bind methods
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.openFileDialog = this.openFileDialog.bind(this);
    this.handleFileSelect = this.handleFileSelect.bind(this);
  }
  
  connectedCallback() {
    this.render();
    this.loadContent();
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .content-manager {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .cm-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e1e5e9;
        }
        
        .cm-upload-area {
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          padding: 3rem 2rem;
          text-align: center;
          background: #f8fafc;
          transition: all 0.2s ease;
          cursor: pointer;
          margin-bottom: 2rem;
        }
        
        .cm-upload-area:hover,
        .cm-upload-area.dragover {
          border-color: #3b82f6;
          background: #eff6ff;
          transform: translateY(-2px);
        }
        
        .cm-upload-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .cm-upload-text p {
          margin: 0.5rem 0;
          color: #4a5568;
        }
        
        .cm-upload-text strong {
          color: #2d3748;
        }
        
        .cm-upload-text span {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .cm-search-bar {
          margin-bottom: 1.5rem;
        }
        
        .cm-search-bar input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }
        
        .cm-filter-tabs {
          display: flex;
          gap: 0.5rem;
        }
        
        .cm-filter-tabs button {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .cm-filter-tabs button:hover {
          background: #f3f4f6;
        }
        
        .cm-filter-tabs button.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        
        .cm-content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .cm-content-item {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .cm-content-item:hover {
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .cm-content-preview {
          height: 120px;
          background: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .cm-content-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .cm-content-info {
          padding: 0.75rem;
        }
        
        .cm-content-name {
          font-weight: 500;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
          color: #1f2937;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .cm-content-meta {
          font-size: 0.75rem;
          color: #6b7280;
          display: flex;
          gap: 0.5rem;
        }
        
        .cm-empty-state {
          text-align: center;
          padding: 3rem 2rem;
          color: #6b7280;
        }
        
        .cm-empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        
        .cm-loading {
          text-align: center;
          padding: 2rem;
        }
        
        .cm-spinner {
          border: 2px solid #f3f4f6;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .hidden {
          display: none !important;
        }
        
        @media (max-width: 768px) {
          .cm-content-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }
        }
      </style>
      
      <div class="content-manager">
        <div class="cm-header">
          <h3>Content Library</h3>
        </div>
        
        <div class="cm-upload-area" id="uploadArea">
          <div class="cm-upload-icon">📁</div>
          <div class="cm-upload-text">
            <p><strong>Drop files here</strong> or <span>Browse Files</span></p>
            <p>Support: Images, Videos, PDFs, Documents (Max 25MB)</p>
          </div>
          <input type="file" 
                 multiple 
                 accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
                 id="fileInput"
                 style="display: none;">
        </div>
        
        <div class="cm-search-bar">
          <input type="text" 
                 placeholder="Search content..."
                 id="searchInput">
          <div class="cm-filter-tabs">
            <button class="active" data-filter="all">All</button>
            <button data-filter="image">Images</button>
            <button data-filter="video">Videos</button>
            <button data-filter="document">Documents</button>
          </div>
        </div>
        
        <div class="cm-gallery">
          <div class="cm-content-grid" id="contentGrid">
            <div class="cm-empty-state">
              <div class="cm-empty-icon">📁</div>
              <h4>No content yet</h4>
              <p>Upload your first file to get started</p>
            </div>
          </div>
        </div>
        
        <div class="cm-loading hidden" id="loading">
          <div class="cm-spinner"></div>
          <p>Loading content...</p>
        </div>
      </div>
    `;
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    const uploadArea = this.shadowRoot.getElementById('uploadArea');
    const fileInput = this.shadowRoot.getElementById('fileInput');
    const searchInput = this.shadowRoot.getElementById('searchInput');
    const filterButtons = this.shadowRoot.querySelectorAll('[data-filter]');
    
    // Upload area events
    uploadArea.addEventListener('dragover', this.handleDragOver);
    uploadArea.addEventListener('dragleave', this.handleDragLeave);
    uploadArea.addEventListener('drop', this.handleDrop);
    uploadArea.addEventListener('click', this.openFileDialog);
    
    // File input
    fileInput.addEventListener('change', this.handleFileSelect);
    
    // Search
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.renderGallery();
    });
    
    // Filter buttons
    filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        filterButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.renderGallery();
      });
    });
  }
  
  handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  }
  
  handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      e.currentTarget.classList.remove('dragover');
    }
  }
  
  handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    this.handleFiles(e.dataTransfer.files);
  }
  
  openFileDialog() {
    const input = this.shadowRoot.getElementById('fileInput');
    input.click();
  }
  
  handleFileSelect(e) {
    this.handleFiles(e.target.files);
  }
  
  async handleFiles(files) {
    for (const file of Array.from(files)) {
      if (file.size > this.maxFileSize) {
        this.showError(`File ${file.name} is too large. Maximum size is 25MB.`);
        continue;
      }
      await this.uploadFile(file);
    }
  }
  
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      this.showLoading(true);
      
      const response = await fetch(`${this.apiBase}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          // Add auth token if available
          ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showSuccess(`${file.name} uploaded successfully`);
        this.loadContent(); // Refresh content list
        this.dispatchEvent(new CustomEvent('content-uploaded', {
          detail: result.content,
          bubbles: true
        }));
      } else {
        this.showError(result.error || 'Upload failed');
      }
    } catch (error) {
      this.showError('Upload failed: ' + error.message);
    } finally {
      this.showLoading(false);
    }
  }
  
  async loadContent() {
    this.showLoading(true);
    
    try {
      const response = await fetch(`${this.apiBase}/library`, {
        headers: {
          ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
        }
      });
      const result = await response.json();
      
      if (result.success) {
        this.content = result.content || [];
        this.renderGallery();
      } else {
        this.showError('Failed to load content');
      }
    } catch (error) {
      this.showError('Failed to load content: ' + error.message);
    } finally {
      this.showLoading(false);
    }
  }
  
  renderGallery() {
    const grid = this.shadowRoot.getElementById('contentGrid');
    const filteredContent = this.getFilteredContent();
    
    if (filteredContent.length === 0) {
      grid.innerHTML = `
        <div class="cm-empty-state">
          <div class="cm-empty-icon">📁</div>
          <h4>No content yet</h4>
          <p>Upload your first file to get started</p>
        </div>
      `;
      return;
    }
    
    grid.innerHTML = filteredContent.map(item => `
      <div class="cm-content-item" data-id="${item.id}">
        <div class="cm-content-preview">
          ${item.category === 'image' 
            ? `<img src="${item.file_url}" alt="${item.original_filename}">`
            : `<div style="font-size: 2rem;">${this.getFileIcon(item.category)}</div>`
          }
        </div>
        <div class="cm-content-info">
          <div class="cm-content-name">${item.original_filename}</div>
          <div class="cm-content-meta">
            <span>${this.formatFileSize(item.file_size)}</span>
            <span>${new Date(item.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  getFilteredContent() {
    let filtered = this.content;
    
    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.original_filename.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(item => item.category === this.currentFilter);
    }
    
    return filtered;
  }
  
  getFileIcon(category) {
    const icons = {
      document: '📄',
      audio: '🎵',
      image: '🖼️',
      video: '🎬'
    };
    return icons[category] || '📁';
  }
  
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  showLoading(show) {
    const loading = this.shadowRoot.getElementById('loading');
    if (show) {
      loading.classList.remove('hidden');
    } else {
      loading.classList.add('hidden');
    }
  }
  
  showSuccess(message) {
    console.log('✅', message);
    // Could implement toast notifications here
  }
  
  showError(message) {
    console.error('❌', message);
    // Could implement toast notifications here
  }
  
  // Property setters for React integration
  set authToken(token) {
    this._authToken = token;
  }
  
  get authToken() {
    return this._authToken;
  }
  
  set currentUser(user) {
    this._currentUser = user;
  }
  
  get currentUser() {
    return this._currentUser;
  }
}

// Register the component
customElements.define('tamyla-content-manager', TamylaContentManager);
