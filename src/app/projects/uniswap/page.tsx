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
    <div className="max-w-6xl">
    <Tabs defaultValue="paper" className="w-full">
      <TabsList>
        <TabsTrigger value="paper">Paper</TabsTrigger>
        <TabsTrigger value="notebook">Notebook</TabsTrigger>
      </TabsList>
      <TabsContent value="paper">
        <Card>
          <CardHeader>
            <CardTitle>Impermanent loss and Swap Fee Modeling in Uniswap v3</CardTitle>
          </CardHeader>
          <CardContent>
            <PDFViewer
              config={{ 
                src: '/IPR.pdf', 
                disabledCategories: ['document-export', 'document-print', 'redaction', 'annotation', 'panel']
              }}
              style={{ height: '600px' }}
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


