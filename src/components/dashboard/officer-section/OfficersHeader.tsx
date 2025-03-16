
import React from 'react';

interface OfficersHeaderProps {
  title?: string;
}

const OfficersHeader: React.FC<OfficersHeaderProps> = ({ title = "Officers" }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );
};

export default OfficersHeader;
