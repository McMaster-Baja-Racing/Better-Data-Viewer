import { analyzerConfig, AnalyzerConfigItem, AnalyzerKey, AnalyzerType } from '@types';

interface LegacyAnalyzerData {
  title: string;
  code: AnalyzerType | null;
  parameters: { name: string; default: string }[];
  checked?: boolean;
  description: string;
  image: {
    link: string;
    alt: string;
    src?: string;
  };
  links: { title: string; link: string }[];
}

export function toLegacyArray(): LegacyAnalyzerData[] {
  return (Object.entries(analyzerConfig) as [AnalyzerKey, AnalyzerConfigItem][])
    .map(([key, cfg]) => {
      const imageSrc = cfg.image?.src ?? '';
      const imageAlt = cfg.image?.alt ?? '';
      const isChecked = cfg.defaultChecked ?? false;
  
      return {
        title:       cfg.title,
        code:        key === 'NONE' ? null : key,
        parameters:  cfg.parameters?.map(p => ({ name: p.name, default: p.defaultValue })) ?? [],
        checked:     isChecked,
        description: cfg.description,
        image: {
          link: imageSrc,
          alt:  imageAlt,
          src:  imageSrc,
        },
        links: cfg.links?.map(l => ({
          title: l.title,
          link:  l.url,
        })) ?? [],
      };
    });
}

export const legacyAnalyzerData = toLegacyArray();