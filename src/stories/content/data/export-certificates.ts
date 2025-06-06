export interface Certificate {
  name: string;
  applicability: string;
  issuingAuthority: string;
  cost: string;
  processingTime: string;
  validity: string;
  inspectionRequired: string;
}

export const exportCertificates: Certificate[] = [
  {
    name: 'IEC',
    applicability: 'All exporters',
    issuingAuthority: 'DGFT',
    cost: '500',
    processingTime: '1-3 days',
    validity: 'Lifetime',
    inspectionRequired: 'No'
  },
  {
    name: 'CRES',
    applicability: 'Spices only',
    issuingAuthority: 'Spices Board',
    cost: '5,000 (new)<br>2,500 (renewal)',
    processingTime: '10 days',
    validity: '3 years',
    inspectionRequired: 'Yes (manufacturers)'
  },
  {
    name: 'FSSAI Central License',
    applicability: 'All food exporters',
    issuingAuthority: 'FSSAI',
    cost: '7,500/year',
    processingTime: 'Up to 60 days',
    validity: '1-5 years',
    inspectionRequired: 'Yes'
  },
  {
    name: 'Phytosanitary Certificate',
    applicability: 'Spices & cereals',
    issuingAuthority: 'PPQS',
    cost: '2,500-5,000',
    processingTime: '2-5 days',
    validity: '21 days',
    inspectionRequired: 'Yes'
  },
  {
    name: 'Fumigation Certificate',
    applicability: 'Pest-prone commodities, wooden packaging',
    issuingAuthority: 'PPQS-accredited agencies',
    cost: '1,000-5,000 (FCL)<br>500/pallet (LCL)',
    processingTime: '1-2 days',
    validity: '21 days',
    inspectionRequired: 'Yes (post-fumigation)'
  },
  {
    name: 'APEDA RCMC',
    applicability: 'Cereals, processed spices',
    issuingAuthority: 'APEDA',
    cost: '5,000 + 18% GST',
    processingTime: '7-15 days',
    validity: '5 years',
    inspectionRequired: 'Yes (manufacturers)'
  },
  {
    name: 'Export Health Certificate (EHC)',
    applicability: 'If required by importer',
    issuingAuthority: 'EIC/EIA',
    cost: 'Varies',
    processingTime: '3-7 days',
    validity: 'Consignment-specific',
    inspectionRequired: 'Yes'
  },
  {
    name: 'Quality Certificate',
    applicability: 'If required by importer',
    issuingAuthority: 'Spices Board/EIC/private',
    cost: 'Varies (testing fees)',
    processingTime: '5-10 days',
    validity: 'Consignment-specific',
    inspectionRequired: 'Yes (lab testing)'
  }
];
