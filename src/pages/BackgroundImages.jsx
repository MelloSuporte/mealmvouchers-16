import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BackgroundImageForm from '../components/admin/BackgroundImageForm';

const BackgroundImages = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Imagens de Fundo</CardTitle>
        </CardHeader>
        <CardContent>
          <BackgroundImageForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default BackgroundImages;