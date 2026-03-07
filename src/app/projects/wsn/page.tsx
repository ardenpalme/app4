"use client"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import dynamic from "next/dynamic";

import { PDFViewer } from '@embedpdf/react-pdf-viewer';

export default function WSNPage(){
  return (
    <div className="max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>Wireless Sensor Network</CardTitle>
        </CardHeader>
        <CardContent>
          <PDFViewer
            config={{ 
              src: '/ECE_Capstone_Final_Report.pdf', 
              disabledCategories: ['document-export', 'document-print', 'redaction', 'annotation', 'panel']
            }}
            style={{ height: '600px' }}
            />
        </CardContent>
      </Card>
    </div>
  );
}

