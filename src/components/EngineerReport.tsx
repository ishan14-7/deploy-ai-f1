import React from 'react';
import type { EngineerReport as EngineerReportType } from '../types/strategy';
import { MessageSquare } from 'lucide-react';

interface EngineerReportProps {
  report?: EngineerReportType;
}

export const EngineerReport: React.FC<EngineerReportProps> = ({ report }) => {
  if (!report) return null;

  return (
    <div className="bg-card border border-border rounded-none p-5 mt-4">
      <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
        <MessageSquare size={20} className="text-primary" />
        Race Engineer Report
      </h3>
      <p className="text-foreground leading-relaxed font-mono text-sm border-l-4 border-primary pl-4 py-2 bg-muted/50 rounded-none">
        {report.summary}
      </p>
    </div>
  );
};
