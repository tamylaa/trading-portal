import React from 'react';
import { exportCertificates } from '../content/data/export-certificates';
import { ExportCertificatesTable } from '@/components/tables/ExportCertificatesTable';

/**
 * ExportCertificatesSection component
 * Displays a table of export certificates with their details
 * 
 * @returns {JSX.Element} The certificates table section
 */
export const ExportCertificatesSection: React.FC = () => {
  return (
    <section className="my-8">
      <h2 className="text-2xl font-bold mb-4">Certificate Comparison Table</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ExportCertificatesTable certificates={exportCertificates} />
      </div>
    </section>
  );
};

export default ExportCertificatesSection;
