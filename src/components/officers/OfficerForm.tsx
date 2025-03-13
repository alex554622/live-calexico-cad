
import React from 'react';
import { Officer } from '@/types';
import { Button } from '@/components/ui/button';
import { useOfficerForm } from '@/hooks/use-officer-form';
import OfficerBasicInfoFields from './OfficerBasicInfoFields';
import OfficerDepartmentFields from './OfficerDepartmentFields';
import OfficerContactFields from './OfficerContactFields';
import OfficerScheduleFields from './OfficerScheduleFields';

interface OfficerFormProps {
  initialData?: Officer;
  onSuccess?: (officer: Officer) => void;
  onCancel?: () => void;
}

const OfficerForm: React.FC<OfficerFormProps> = ({ 
  initialData, 
  onSuccess, 
  onCancel 
}) => {
  const {
    formData,
    isSubmitting,
    handleChange,
    handleSelectChange,
    handleSubmit
  } = useOfficerForm({
    initialData,
    onSuccess
  });
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <OfficerBasicInfoFields
        name={formData.name}
        badgeNumber={formData.badgeNumber}
        onChange={handleChange}
      />
      
      <OfficerDepartmentFields
        rank={formData.rank}
        department={formData.department}
        onChange={handleChange}
      />
      
      <OfficerContactFields
        phone={formData.contactInfo.phone}
        email={formData.contactInfo.email}
        onChange={handleChange}
      />
      
      <OfficerScheduleFields
        shiftSchedule={formData.shiftSchedule}
        status={formData.status}
        onInputChange={handleChange}
        onSelectChange={handleSelectChange}
      />
      
      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Officer' : 'Create Officer'}
        </Button>
      </div>
    </form>
  );
};

export default OfficerForm;
