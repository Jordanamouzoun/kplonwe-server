import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, AlertCircle } from 'lucide-react';

export function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Retour à l'accueil</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-12">
          
          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-primary-600" size={32} />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Conditions d'utilisation
            </h1>
          </div>

          <p className="text-sm text-gray-500 mb-8">
            Dernière mise à jour : 1er mars 2026
          </p>

          {/* Content */}
          <div className="prose prose-gray max-w-none space-y-6">
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptation des conditions</h2>
              <p className="text-gray-700 leading-relaxed">
                En utilisant la plateforme KPLONWE, vous acceptez d'être lié par les présentes conditions d'utilisation. 
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Description du service</h2>
              <p className="text-gray-700 leading-relaxed">
                KPLONWE est une plateforme éducative qui met en relation des enseignants, des parents et des élèves. 
                Nous facilitons l'apprentissage en ligne et la gestion des cours particuliers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Inscription et compte utilisateur</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Vous devez fournir des informations exactes et à jour lors de votre inscription</li>
                <li>Vous êtes responsable de la confidentialité de vos identifiants</li>
                <li>Vous devez avoir au moins 18 ans pour créer un compte enseignant ou école</li>
                <li>Les comptes parents peuvent créer des profils pour leurs enfants mineurs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Utilisation acceptable</h2>
              <p className="text-gray-700 leading-relaxed mb-3">Vous vous engagez à ne pas :</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Utiliser la plateforme à des fins illégales</li>
                <li>Publier du contenu offensant, discriminatoire ou inapproprié</li>
                <li>Harceler ou menacer d'autres utilisateurs</li>
                <li>Usurper l'identité d'une autre personne</li>
                <li>Tenter de pirater ou compromettre la sécurité de la plateforme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Validation des enseignants</h2>
              <p className="text-gray-700 leading-relaxed">
                Tous les profils d'enseignants sont soumis à validation par notre équipe administrative. 
                Nous nous réservons le droit de refuser ou suspendre tout compte qui ne répond pas à nos critères de qualité.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Paiements et remboursements</h2>
              <p className="text-gray-700 leading-relaxed">
                Les transactions financières sont traitées de manière sécurisée via notre système de portefeuille. 
                Les conditions de remboursement sont détaillées dans notre politique de remboursement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Propriété intellectuelle</h2>
              <p className="text-gray-700 leading-relaxed">
                Tout le contenu présent sur KPLONWE (logo, design, textes, etc.) est protégé par les droits d'auteur 
                et appartient à KPLONWE ou à ses partenaires.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Limitation de responsabilité</h2>
              <p className="text-gray-700 leading-relaxed">
                KPLONWE agit comme intermédiaire entre enseignants et élèves. Nous ne sommes pas responsables 
                de la qualité des cours dispensés ou des interactions entre utilisateurs.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Modification des conditions</h2>
              <p className="text-gray-700 leading-relaxed">
                Nous nous réservons le droit de modifier ces conditions à tout moment. 
                Les utilisateurs seront informés des changements significatifs.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contact</h2>
              <p className="text-gray-700 leading-relaxed">
                Pour toute question concernant ces conditions, vous pouvez nous contacter à : 
                <a href="mailto:support@kplonwe.com" className="text-primary-600 hover:underline ml-1">
                  support@kplonwe.com
                </a>
              </p>
            </section>

          </div>

          {/* Footer notice */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <Shield className="text-blue-600 flex-shrink-0 mt-1" size={20} />
            <p className="text-sm text-blue-900">
              En continuant à utiliser KPLONWE, vous acceptez ces conditions d'utilisation dans leur intégralité.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
