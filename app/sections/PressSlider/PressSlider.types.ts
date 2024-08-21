import type {ContainerSettings} from '~/settings/container';
import type {ColorHexCode, ImageCms} from '~/lib/types';

interface Section {
  fullWidth: boolean;
  textColor: ColorHexCode;
}

interface Slide {
  alt: string;
  image: ImageCms;
  quote: string;
}

export interface PressSliderCms {
  section: Section;
  slides: Slide[];
  container: ContainerSettings;
}

export interface PressSliderThumbProps {
  alt?: string;
  image?: ImageCms;
  isActive?: boolean;
  onClick?: () => void;
}
