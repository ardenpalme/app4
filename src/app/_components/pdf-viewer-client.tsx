'use client';

import { PDFViewer } from '@embedpdf/react-pdf-viewer';

export default function PDFViewerClient({ src }: { src: string }) {
  return (
    <PDFViewer
      config={{ 
        src,
        disabledCategories: ['document-export', 'document-print', 'redaction', 'annotation', 'panel'],
        zoom: {
          defaultZoomLevel: 'fit-width'
        }
      }}
      style={{ height: '100%', width: '100%' }}
    />
  );
}
