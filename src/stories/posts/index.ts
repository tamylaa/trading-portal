// Export all stories from this directory
import { spicesExportGuide } from '@/stories/posts/spices-export-guide';
import { githubCloudflareGuide } from '@/stories/posts/github-cloudflare';
import { brevoChatIntegration } from '@/stories/posts/brevo-chat-integration';
import { dubaiFreeZonesGuide } from '@/stories/posts/dubai-free-zones-guide';
import { engagekitDemo } from '@/stories/posts/engagekit-demo';

export const posts = [  
  engagekitDemo,
  spicesExportGuide,
  githubCloudflareGuide,
  brevoChatIntegration,
  dubaiFreeZonesGuide
];

// Re-export individual stories for named imports
export { spicesExportGuide } from './spices-export-guide';
export { githubCloudflareGuide } from './github-cloudflare';
export { brevoChatIntegration } from './brevo-chat-integration';
export { engagekitDemo } from './engagekit-demo';
