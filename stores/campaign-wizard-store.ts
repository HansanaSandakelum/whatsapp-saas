import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Step1State, 
  Step2State, 
  Step4State, 
  VariableMapping, 
  ResolvedAudience 
} from '@/types/campaign';

type WizardState = {
  campaignId?: string;
  step: 1 | 2 | 3 | 4 | 5;
  step1: Step1State;
  step2: Step2State;
  audiencePreview?: ResolvedAudience;
  step3: VariableMapping;
  step4: Step4State;
  step5: { optInConfirmed: boolean };

  setStep: (step: 1 | 2 | 3 | 4 | 5) => void;
  updateStep1: (data: Partial<Step1State>) => void;
  updateStep2: (data: Partial<Step2State>) => void;
  setAudiencePreview: (data: ResolvedAudience) => void;
  updateStep3: (mapping: VariableMapping) => void;
  updateStep4: (data: Partial<Step4State>) => void;
  updateStep5: (data: Partial<{ optInConfirmed: boolean }>) => void;
  reset: () => void;
};

export const useCampaignWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      step: 1,
      step1: { name: '', senderId: '', templateId: '' },
      step2: { mode: 'GROUP', groupIds: [] },
      step3: {},
      step4: { mode: 'SEND_NOW' },
      step5: { optInConfirmed: false },
      
      setStep: (step) => set({ step }),
      updateStep1: (data) => set((s) => ({ step1: { ...s.step1, ...data } })),
      updateStep2: (data) => set((s) => ({ step2: { ...s.step2, ...data } as Step2State })),
      setAudiencePreview: (data) => set({ audiencePreview: data }),
      updateStep3: (step3) => set({ step3 }),
      updateStep4: (data) => set((s) => ({ step4: { ...s.step4, ...data } as Step4State })),
      updateStep5: (data) => set((s) => ({ step5: { ...s.step5, ...data } })),
      reset: () => set({
        step: 1,
        step1: { name: '', senderId: '', templateId: '' },
        step2: { mode: 'GROUP', groupIds: [] },
        step3: {},
        step4: { mode: 'SEND_NOW' },
        step5: { optInConfirmed: false },
        audiencePreview: undefined,
        campaignId: undefined,
      }),
    }),
    { name: 'campaign-wizard', version: 1 },
  ),
);
