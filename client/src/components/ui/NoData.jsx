import React from "react";
import { MdSearchOff } from "react-icons/md";

const NoData = ({
  message = "No data found",
  description = "Try adjusting your search or filters",
  icon: Icon = MdSearchOff,
  actionButton,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-24 h-24 rounded-full bg-secondary-100 flex items-center justify-center mb-4">
        <Icon size={48} className="text-secondary-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{message}</h3>
      <p className="text-secondary-500 text-center mb-6 max-w-md">
        {description}
      </p>
      {actionButton && actionButton}
    </div>
  );
};

export default NoData;
