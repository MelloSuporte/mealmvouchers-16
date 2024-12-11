import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import BackgroundImageForm from '../components/admin/BackgroundImageForm';

const BackgroundImages = () => {
  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-3xl mx-auto shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-medium">Gerenciamento de Imagens de Fundo</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Configure as imagens de fundo para diferentes telas do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BackgroundImageForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default BackgroundImages;