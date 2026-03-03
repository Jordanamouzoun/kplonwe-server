import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Button } from '@/components/ui/Button';
import { Eye, Type, Contrast, Sparkles } from 'lucide-react';
import type { TextSize, ContrastMode, AnimationMode } from '@/types';

export function AccessibilitySettingsPage() {
  const { settings, setTextSize, setContrastMode, setAnimationMode } = useAccessibility();

  const textSizes: Array<{ value: TextSize; label: string }> = [
    { value: 'small', label: 'Petit' },
    { value: 'medium', label: 'Moyen' },
    { value: 'large', label: 'Grand' },
    { value: 'xlarge', label: 'Très grand' },
  ];

  const contrastModes: Array<{ value: ContrastMode; label: string }> = [
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'Élevé' },
  ];

  const animationModes: Array<{ value: AnimationMode; label: string }> = [
    { value: 'normal', label: 'Normales' },
    { value: 'reduced', label: 'Réduites' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Paramètres d'accessibilité</h1>
      <p className="text-gray-600 mb-8">
        Personnalisez votre expérience pour une meilleure accessibilité
      </p>

      <div className="space-y-6">
        {/* Taille du texte */}
        <section className="bg-white p-6 rounded-lg shadow-md" aria-labelledby="text-size-section">
          <div className="flex items-start gap-4 mb-4">
            <Type className="text-primary-600 flex-shrink-0" size={24} aria-hidden="true" />
            <div className="flex-1">
              <h2 id="text-size-section" className="text-xl font-semibold text-gray-900 mb-1">
                Taille du texte
              </h2>
              <p className="text-sm text-gray-600">
                Ajustez la taille du texte pour une meilleure lisibilité
              </p>
            </div>
          </div>

          <div role="radiogroup" aria-labelledby="text-size-section" className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {textSizes.map((size) => (
              <button
                key={size.value}
                type="button"
                role="radio"
                aria-checked={settings.textSize === size.value}
                onClick={() => setTextSize(size.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  settings.textSize === size.value
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400'
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              >
                <p className={`font-semibold mb-1 ${
                  size.value === 'small' ? 'text-sm' :
                  size.value === 'medium' ? 'text-base' :
                  size.value === 'large' ? 'text-lg' :
                  'text-xl'
                }`}>
                  Aa
                </p>
                <p className="text-sm text-gray-600">{size.label}</p>
              </button>
            ))}
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Prévisualisation :</strong> {' '}
              <span style={{
                fontSize: settings.textSize === 'small' ? '0.875rem' :
                          settings.textSize === 'medium' ? '1rem' :
                          settings.textSize === 'large' ? '1.125rem' :
                          '1.25rem'
              }}>
                Ceci est un exemple de texte avec votre taille sélectionnée.
              </span>
            </p>
          </div>
        </section>

        {/* Contraste */}
        <section className="bg-white p-6 rounded-lg shadow-md" aria-labelledby="contrast-section">
          <div className="flex items-start gap-4 mb-4">
            <Contrast className="text-primary-600 flex-shrink-0" size={24} aria-hidden="true" />
            <div className="flex-1">
              <h2 id="contrast-section" className="text-xl font-semibold text-gray-900 mb-1">
                Mode de contraste
              </h2>
              <p className="text-sm text-gray-600">
                Augmentez le contraste pour une meilleure distinction visuelle (utile pour malvoyants et daltoniens)
              </p>
            </div>
          </div>

          <div role="radiogroup" aria-labelledby="contrast-section" className="grid grid-cols-2 gap-3">
            {contrastModes.map((mode) => (
              <button
                key={mode.value}
                type="button"
                role="radio"
                aria-checked={settings.contrastMode === mode.value}
                onClick={() => setContrastMode(mode.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  settings.contrastMode === mode.value
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400'
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              >
                <p className="font-semibold text-gray-900">{mode.label}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {mode.value === 'normal'
                    ? 'Contraste standard'
                    : 'Contraste élevé, bordures renforcées'}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Animations */}
        <section className="bg-white p-6 rounded-lg shadow-md" aria-labelledby="animation-section">
          <div className="flex items-start gap-4 mb-4">
            <Sparkles className="text-primary-600 flex-shrink-0" size={24} aria-hidden="true" />
            <div className="flex-1">
              <h2 id="animation-section" className="text-xl font-semibold text-gray-900 mb-1">
                Animations
              </h2>
              <p className="text-sm text-gray-600">
                Réduisez les animations si elles causent des distractions ou malaises
              </p>
            </div>
          </div>

          <div role="radiogroup" aria-labelledby="animation-section" className="grid grid-cols-2 gap-3">
            {animationModes.map((mode) => (
              <button
                key={mode.value}
                type="button"
                role="radio"
                aria-checked={settings.animationMode === mode.value}
                onClick={() => setAnimationMode(mode.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  settings.animationMode === mode.value
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400'
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              >
                <p className="font-semibold text-gray-900">{mode.label}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {mode.value === 'normal'
                    ? 'Toutes les animations'
                    : 'Animations minimales'}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Informations lecteurs d'écran */}
        <section className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500" role="note">
          <div className="flex items-start gap-4">
            <Eye className="text-blue-600 flex-shrink-0" size={24} aria-hidden="true" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Compatibilité lecteurs d'écran
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                KPLONWE est entièrement compatible avec les lecteurs d'écran (NVDA, JAWS, VoiceOver).
                Toutes les fonctionnalités sont accessibles au clavier.
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Tab</strong> : Naviguer entre les éléments</li>
                <li>• <strong>Entrée/Espace</strong> : Activer boutons et liens</li>
                <li>• <strong>Escape</strong> : Fermer les modales</li>
                <li>• <strong>Flèches</strong> : Naviguer dans les listes</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Informations daltonisme */}
        <section className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500" role="note">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            Accessibilité pour daltoniens
          </h3>
          <p className="text-sm text-purple-800">
            Les informations importantes ne reposent jamais uniquement sur la couleur. 
            Nous utilisons des icônes, des motifs et du texte pour garantir que tous les utilisateurs 
            puissent distinguer les différents états et messages.
          </p>
        </section>

        {/* Réinitialiser */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setTextSize('medium');
              setContrastMode('normal');
              setAnimationMode('normal');
            }}
          >
            Réinitialiser les paramètres
          </Button>
        </div>
      </div>
    </div>
  );
}
