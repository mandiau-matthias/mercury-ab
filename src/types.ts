export type ExperimentKey = string;
export type VariantKey = string;
export type TargetingContext = {
  locale: string;
  authState: 'authenticated' | 'anonymous' | 'unknown';
  role: string;
  isInternal: boolean;
};
export type TargetingRule = (context: TargetingContext) => boolean;
export type RegistryEntry = {
  key: ExperimentKey;
  status: 'running' | 'paused' | 'draft' | 'shipped';
  variants: { key: VariantKey; weight: number }[];
  enrollmentPercent?: number;
  targeting?: TargetingRule;
};
