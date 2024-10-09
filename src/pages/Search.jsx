import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Search = () => {
  return (
    <div className="p-4 space-y-6">
      <Input type="search" placeholder="Search" className="w-full" />
      <div className="space-y-2">
        <Button className="w-full">Almoço</Button>
        <Button className="w-full">Janta</Button>
        <Button className="w-full">Café</Button>
      </div>
    </div>
  );
};

export default Search;