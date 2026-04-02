import React from 'react';
import { PlusCircle } from 'lucide-react';

interface CreateButtonProps {
  onClick: () => void;
  label: string;
  className?: string;
  icon?: React.ReactNode;
}

const CreateButton: React.FC<CreateButtonProps> = ({ 
  onClick, 
  label, 
  className = "", 
  icon = <PlusCircle className="h-5 w-5 transition-transform group-hover:rotate-90" />
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 font-bold group ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default CreateButton;
