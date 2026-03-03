export type TextSize = 'small' | 'medium' | 'large' | 'xlarge';
export type ContrastMode = 'normal' | 'high';
export type AnimationMode = 'normal' | 'reduced';

export interface AccessibilitySettings {
  textSize: TextSize;
  contrastMode: ContrastMode;
  animationMode: AnimationMode;
  reducedMotion: boolean;
}
