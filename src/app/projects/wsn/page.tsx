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
    <div className="max-w-full h-svh">
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Wireless Sensor Network</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0" >
          <PDFViewer
            config={{ 
              src: '/ECE_Capstone_Final_Report.pdf', 
              disabledCategories: ['document-export', 'document-print', 'redaction', 'annotation', 'panel'],
              zoom: {
                defaultZoomLevel: 'fit-width'
              }
            }}
            style={{ height: '100%', width: '100%'}}
            />
        </CardContent>
      </Card>
    </div>
  );
}

