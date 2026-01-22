import { configManager } from './config';
import { createHubApiClient } from '@tamyla/shared';
import { contentApi } from '../api/content';

// Content Hub API Client - now uses the migrated contentApi
export class ContentHubAPI {
  constructor(config = {}) {
    this.config = config;
    this.apiClient = createHubApiClient(configManager, config);
  }

  // Delegate to migrated contentApi for comprehensive functionality
  async checkHealth() {
    return await contentApi.checkHealth();
  }

  async uploadFile(file, options = {}) {
    return await contentApi.uploadFile(file, options);
  }

  async getUserFiles(options = {}) {
    return await contentApi.getUserFiles(options);
  }

  async getSessionFiles() {
    return await contentApi.getSessionFiles();
  }

  async getFileStats() {
    return await contentApi.getFileStats();
  }

  async downloadFile(fileId, options = {}) {
    return await contentApi.downloadFile(fileId, options);
  }

  async makeFilesPublic(fileIds) {
    return await contentApi.makeFilesPublic(fileIds);
  }

  async generatePublicUrls(files) {
    return contentApi.generatePublicUrls(files);
  }

  // Legacy methods for backward compatibility
  async getContent(query = {}) {
    const result = await this.getUserFiles(query);
    return result.success ? result.files : [];
  }

  async searchContent(query) {
    // This would need MeiliSearch integration - for now delegate to getUserFiles with search
    const result = await this.getUserFiles({ search: query });
    return result.success ? result.files : [];
  }
}

// Content Hub Package Index
export { ContentHub } from './ContentHub';
export { EVENT_TYPES } from '@tamyla/shared';
