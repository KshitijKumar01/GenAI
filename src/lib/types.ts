// src/lib/types.ts

export interface TestCase {
  id: string;
  content: string;
}

export interface ComplianceStandard {
  id: string;
  name: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface ComplianceResult {
  testCaseId: string;
  standardId: string;
  status: 'passed' | 'failed' | 'pending';
  feedback?: string;
}

export interface Toolchain {
  id: string;
  name:string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}
