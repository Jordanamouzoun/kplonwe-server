import { Link } from 'react-router-dom';
import { 
  BookOpen, Users, TrendingUp, Shield, Zap, Globe, 
  Check, ArrowRight, Star, MessageSquare, CreditCard, Award 
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      
      {/* ═══ HERO SECTION ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -right-4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left: Text Content */}
            <div className="text-center lg:text-left space-y-6 lg:space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                <Zap size={16} className="text-yellow-300" />
                <span>Plateforme éducative #1 au Bénin</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight tracking-tight">
                L'éducation
                <span className="block text-yellow-300 mt-2">à portée de main</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-100 max-w-2xl mx-auto lg:mx-0">
                Connectez enseignants, parents et élèves sur une plateforme moderne. 
                Quiz interactifs, messagerie, paiements sécurisés et orientation professionnelle.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 hover:bg-gray-50 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg shadow-xl transition-all transform hover:scale-105"
                >
                  Commencer gratuitement
                  <ArrowRight size={20} />
                </Link>
                <Link 
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white hover:bg-white/10 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-all"
                >
                  Se connecter
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-4 text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <Check size={18} className="text-green-300" />
                  <span>100% gratuit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={18} className="text-green-300" />
                  <span>Sans engagement</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={18} className="text-green-300" />
                  <span>Sécurisé</span>
                </div>
              </div>
            </div>

            {/* Right: Visual/Stats */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-2">
                  <Users className="text-yellow-300" size={32} />
                  <p className="text-3xl font-bold">1000+</p>
                  <p className="text-sm text-gray-200">Utilisateurs actifs</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-2 mt-8">
                  <BookOpen className="text-yellow-300" size={32} />
                  <p className="text-3xl font-bold">500+</p>
                  <p className="text-sm text-gray-200">Quiz disponibles</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-2 -mt-4">
                  <Award className="text-yellow-300" size={32} />
                  <p className="text-3xl font-bold">200+</p>
                  <p className="text-sm text-gray-200">Enseignants vérifiés</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-2 mt-4">
                  <TrendingUp className="text-yellow-300" size={32} />
                  <p className="text-3xl font-bold">98%</p>
                  <p className="text-sm text-gray-200">Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12 sm:h-16 lg:h-20">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ═══ FEATURES ═══════════════════════════════════════════════ */}
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Une plateforme complète pour révolutionner l'apprentissage au Bénin
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: BookOpen,
                title: 'Quiz interactifs',
                description: 'Créez et passez des quiz personnalisés avec correction automatique',
                color: 'bg-blue-100 text-blue-600',
              },
              {
                icon: MessageSquare,
                title: 'Messagerie intégrée',
                description: 'Échangez facilement avec enseignants, parents et élèves',
                color: 'bg-green-100 text-green-600',
              },
              {
                icon: CreditCard,
                title: 'Paiements sécurisés',
                description: 'MoMo Pay, Moov Money et cartes bancaires acceptés',
                color: 'bg-purple-100 text-purple-600',
              },
              {
                icon: Award,
                title: 'Enseignants vérifiés',
                description: 'Tous les professeurs sont validés par notre équipe',
                color: 'bg-yellow-100 text-yellow-600',
              },
              {
                icon: TrendingUp,
                title: 'Orientation professionnelle',
                description: 'Découvrez les métiers et formations qui vous correspondent',
                color: 'bg-red-100 text-red-600',
              },
              {
                icon: Shield,
                title: 'Données sécurisées',
                description: 'Vos informations sont protégées avec les meilleurs standards',
                color: 'bg-indigo-100 text-indigo-600',
              },
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all border border-gray-100 hover:border-primary-200 group"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Tarifs transparents
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Choisissez la formule adaptée à vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {/* Gratuit */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border-2 border-gray-200">
              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Gratuit</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">0</span>
                  <span className="text-gray-600">FCFA/mois</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Accès aux quiz publics',
                  'Messagerie basique',
                  '7 quiz/mois (écoles)',
                  'Support communautaire',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link 
                to="/register"
                className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-lg transition"
              >
                Commencer
              </Link>
            </div>

            {/* Premium (Highlighted) */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-primary-500 transform lg:scale-105 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                POPULAIRE
              </div>
              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Premium</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-white">5000</span>
                  <span className="text-gray-200">FCFA/mois</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Tout du plan Gratuit',
                  'Quiz illimités',
                  'Badge vérifié',
                  'Support prioritaire',
                  'Statistiques avancées',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check size={20} className="text-yellow-300 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-white">{item}</span>
                  </li>
                ))}
              </ul>
              <Link 
                to="/register"
                className="block w-full text-center bg-white hover:bg-gray-50 text-primary-700 font-bold py-3 rounded-lg transition shadow-lg"
              >
                Essayer Premium
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border-2 border-gray-200">
              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Entreprise</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">Sur devis</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Tout du plan Premium',
                  'API personnalisée',
                  'Multi-établissements',
                  'Support dédié 24/7',
                  'Formation sur site',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <button className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-lg transition">
                Nous contacter
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ══════════════════════════════════════════════ */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
            Prêt à transformer l'éducation ?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Rejoignez des centaines d'enseignants, parents et élèves qui utilisent déjà KPLONWE.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 hover:bg-gray-50 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg shadow-xl transition-all transform hover:scale-105"
            >
              Créer un compte gratuit
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═════════════════════════════════════════════════ */}
      <footer className="bg-gray-900 text-gray-300 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/logo-kplonwe.png" 
                  alt="KPLONWE" 
                  className="h-14 sm:h-16 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-gray-400">
                La plateforme éducative qui connecte enseignants, parents et élèves.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm sm:text-base">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white transition">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm sm:text-base">Entreprise</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">À propos</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Carrières</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm sm:text-base">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition">CGU</a></li>
                <li><a href="#" className="hover:text-white transition">Mentions légales</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>
              © 2026{' '}
              <span className="text-primary-400">KPL</span>
              <span className="text-[#FDB32A]">O</span>
              <span className="text-primary-400">NWE</span>
              . Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
