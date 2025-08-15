// Enhanced component architecture - additive only
// This creates type definitions for future modular components while keeping existing ones intact

import React from 'react';

// Base component interfaces that extend existing patterns
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface EnhancedEmailBlasterProps extends BaseComponentProps {
  onClose?: () => void;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  mode?: 'compose' | 'templates' | 'campaigns' | 'contacts';
  initialData?: any;
}

// Type definitions for future modular components
export interface EmailComposerProps extends BaseComponentProps {
  onSend?: (data: any) => void;
  initialContent?: string;
}

export interface CampaignManagerProps extends BaseComponentProps {
  campaigns?: any[];
  onCampaignSelect?: (campaign: any) => void;
}

export interface ContactManagerProps extends BaseComponentProps {
  contacts?: any[];
  onContactAdd?: (contact: any) => void;
}

export interface EmailTemplatesProps extends BaseComponentProps {
  templates?: any[];
  onTemplateSelect?: (template: any) => void;
}

// Progressive enhancement wrapper interface
export interface ProgressiveEmailBlasterProps extends EnhancedEmailBlasterProps {
  useLegacyMode?: boolean; // Fallback to original component
}
