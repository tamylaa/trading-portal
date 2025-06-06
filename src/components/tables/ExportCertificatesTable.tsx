import React, { useRef } from 'react';
import { Certificate } from '@/stories/content/data/export-certificates';
import styles from './ExportCertificatesTable.module.css';

/**
 * Props for the ExportCertificatesTable component
 */
export interface ExportCertificatesTableProps {
  /** Array of certificate objects to display in the table */
  certificates: Certificate[];
  /** Additional CSS class name for the table container */
  className?: string;
}

/**
 * A responsive table component that displays export certificate information
 */
export const ExportCertificatesTable: React.FC<ExportCertificatesTableProps> = ({
  certificates,
  className = ''
}) => {
  const tableRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    if (!tableRef.current) return;
    
    // Create a new window with the table content
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Get current date for the filename
    const today = new Date();
    const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
    // Create a clean HTML document with the table
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Export Certificates Comparison - ${dateString}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #2d3748; font-size: 1.5rem; margin-bottom: 1.5rem; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
          th, td { border: 1px solid #e2e8f0; padding: 0.5rem; text-align: left; }
          th { background-color: #f8fafc; font-weight: 600; }
          .note { font-size: 0.875rem; color: #4a5568; margin-top: 1rem; }
          @media print {
            body { margin: 0; padding: 10px; }
            @page { size: auto; margin: 10mm 10mm 10mm 10mm; }
          }
        </style>
      </head>
      <body>
        <h1>Export Certificates Comparison</h1>
        ${tableRef.current.innerHTML}
        <p class="note">Generated on ${today.toLocaleDateString()} - Tamyla Trading Portal</p>
      </body>
      </html>
    `;
    
    // Write the HTML to the new window
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className={`${styles.tableContainer} ${className}`} data-testid="export-certificates-table">
      <div className={styles.tableWrapper}>
        <div className={styles.scrollContainer} ref={tableRef}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.headerCell}>Certificate</th>
                <th className={styles.headerCell}>Applicability</th>
                <th className={styles.headerCell}>Issuing Authority</th>
                <th className={styles.headerCell}>Cost (INR)</th>
                <th className={styles.headerCell}>Processing Time</th>
                <th className={styles.headerCell}>Validity</th>
                <th className={styles.headerCell}>Inspection Required?</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert, index) => (
                <tr key={`${cert.name}-${index}`} className={styles.row} data-certificate={cert.name.toLowerCase().replace(/\s+/g, '-')}>
                  <td className={`${styles.cell} ${styles.certificateName}`}>
                    <strong>{cert.name}</strong>
                  </td>
                  <td 
                    className={styles.cell}
                    dangerouslySetInnerHTML={{ __html: cert.applicability }}
                  />
                  <td 
                    className={styles.cell}
                    dangerouslySetInnerHTML={{ __html: cert.issuingAuthority }}
                  />
                  <td 
                    className={styles.cell}
                    dangerouslySetInnerHTML={{ __html: cert.cost }}
                  />
                  <td 
                    className={styles.cell}
                    dangerouslySetInnerHTML={{ __html: cert.processingTime }}
                  />
                  <td 
                    className={styles.cell}
                    dangerouslySetInnerHTML={{ __html: cert.validity }}
                  />
                  <td 
                    className={`${styles.cell} ${styles.inspectionCell}`}
                    dangerouslySetInnerHTML={{ __html: cert.inspectionRequired }}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className={styles.footer}>
          <p className={styles.note}>
            <strong>Note:</strong> Costs and timelines may vary based on consignment size or importing country requirements.
          </p>
          <button 
            onClick={handleDownloadPDF}
            className={styles.downloadBtn}
            aria-label="Download Export Certificates Comparison as PDF"
          >
            <span className={styles.downloadIcon}>↓</span>
            Download Table as PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportCertificatesTable;
