import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const VoucherTable = ({ vouchers }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <Label className="text-lg font-bold">Vouchers Descartáveis</Label>
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Tipo de Refeição</TableHead>
                <TableHead>Data de Expiração</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((voucher, index) => (
                <TableRow key={index}>
                  <TableCell>{voucher.code}</TableCell>
                  <TableCell>{voucher.meal_type_name}</TableCell>
                  <TableCell>
                    {new Date(voucher.expired_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {voucher.is_used ? 'Utilizado' : 'Disponível'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoucherTable;