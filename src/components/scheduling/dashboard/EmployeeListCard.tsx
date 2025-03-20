
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Employee, EmployeeBreak } from '@/types/scheduling';
import { EmployeeList } from './EmployeeList';

interface EmployeeListCardProps {
  employees: Employee[];
  activeBreaks: EmployeeBreak[];
  loading: boolean;
}

export function EmployeeListCard({ employees, activeBreaks, loading }: EmployeeListCardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter employees based on search query
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Employees</CardTitle>
        <CardDescription>
          Real-time status of employees currently on shift
        </CardDescription>
        
        <div className="mt-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <EmployeeList 
          employees={filteredEmployees} 
          activeBreaks={activeBreaks} 
          loading={loading} 
        />
      </CardContent>
    </Card>
  );
}
