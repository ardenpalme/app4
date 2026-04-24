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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { PDFViewer } from '@embedpdf/react-pdf-viewer';

export default function WSNPage(){
  return (
    <div className="max-w-full h-svh">
    <Tabs defaultValue="paper" className="w-full h-full">
      <TabsList>
        <TabsTrigger value="paper" className="cursor-pointer">Paper</TabsTrigger>
        <TabsTrigger value="notebook" className="cursor-pointer">Notebook</TabsTrigger>
      </TabsList>
      <TabsContent value="paper" className="h-full">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Impermanent loss and Swap Fee Modeling in Uniswap v3</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <PDFViewer
              config={{ 
                src: '/IPR.pdf', 
                disabledCategories: ['document-export', 'document-print', 'redaction', 'annotation', 'panel'],
                zoom: {
                  defaultZoomLevel: 'fit-width'
                }
              }}
              style={{ height: '100%', width: '100%' }}
              />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="notebook">
        <iframe src="/notebooks/IPR.html" className="w-full h-screen" sandbox="allow-scripts allow-same-origin allow-popups"/>
      </TabsContent>
    </Tabs>

    </div>
  );
}


