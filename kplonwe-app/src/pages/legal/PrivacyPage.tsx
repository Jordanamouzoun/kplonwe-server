import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, Database, Shield } from 'lucide-react';

export function PrivacyPage() {
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
            <Lock className="text-primary-600" size={32} />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Politique de confidentialité
            </h1>
          </div>

          <p className="text-sm text-gray-500 mb-8">
            Dernière mise à jour : 1er mars 2026
          </p>

          {/* Content */}
          <div className="prose prose-gray max-w-none space-y-6">
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Chez KPLONWE, nous prenons très au sérieux la protection de vos données personnelles. 
                Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Données collectées</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Database className="text-gray-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Informations d'inscription</p>
                    <p className="text-sm text-gray-700">Nom, prénom, email, numéro de téléphone, rôle (parent/enseignant/école)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Database className="text-gray-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Informations de profil</p>
                    <p className="text-sm text-gray-700">Photo de profil, biographie, matières enseignées, diplômes (pour les enseignants)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Database className="text-gray-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Données de navigation</p>
                    <p className="text-sm text-gray-700">Adresse IP, type de navigateur, pages visitées, durée de visite</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Database className="text-gray-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Données de transaction</p>
                    <p className="text-sm text-gray-700">Historique des paiements, solde du portefeuille, méthodes de paiement</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Utilisation des données</h2>
              <p className="text-gray-700 leading-relaxed mb-3">Nous utilisons vos données pour :</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Créer et gérer votre compte</li>
                <li>Faciliter la mise en relation entre enseignants et élèves</li>
                <li>Traiter les paiements de manière sécurisée</li>
                <li>Améliorer nos services et l'expérience utilisateur</li>
                <li>Vous envoyer des notifications importantes concernant votre compte</li>
                <li>Prévenir la fraude et garantir la sécurité de la plateforme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Partage des données</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Nous ne vendons jamais vos données personnelles. Vos informations peuvent être partagées uniquement dans les cas suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Avec d'autres utilisateurs :</strong> Les informations de profil des enseignants sont visibles publiquement</li>
                <li><strong>Prestataires de services :</strong> Partenaires de paiement, hébergement, analyses (sous contrat strict de confidentialité)</li>
                <li><strong>Obligations légales :</strong> Si requis par la loi ou dans le cadre d'une procédure judiciaire</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Protection des données</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <Lock className="text-green-600 mb-2" size={24} />
                  <p className="font-semibold text-green-900 mb-1">Chiffrement SSL/TLS</p>
                  <p className="text-sm text-green-800">Toutes les communications sont chiffrées</p>
                </div>
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <Shield className="text-green-600 mb-2" size={24} />
                  <p className="font-semibold text-green-900 mb-1">Mots de passe sécurisés</p>
                  <p className="text-sm text-green-800">Hashage bcrypt avec salt</p>
                </div>
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <Database className="text-green-600 mb-2" size={24} />
                  <p className="font-semibold text-green-900 mb-1">Bases de données sécurisées</p>
                  <p className="text-sm text-green-800">Accès restreint et sauvegardes régulières</p>
                </div>
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <Eye className="text-green-600 mb-2" size={24} />
                  <p className="font-semibold text-green-900 mb-1">Surveillance continue</p>
                  <p className="text-sm text-green-800">Détection des activités suspectes</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Vos droits</h2>
              <p className="text-gray-700 leading-relaxed mb-3">Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Droit d'accès :</strong> Demander une copie de vos données personnelles</li>
                <li><strong>Droit de rectification :</strong> Corriger vos informations inexactes</li>
                <li><strong>Droit à l'effacement :</strong> Supprimer votre compte et vos données</li>
                <li><strong>Droit d'opposition :</strong> Refuser certains traitements de données</li>
                <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                Nous utilisons des cookies pour améliorer votre expérience. 
                Les cookies essentiels sont nécessaires au fonctionnement de la plateforme. 
                Vous pouvez désactiver les cookies non essentiels dans les paramètres de votre navigateur.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Conservation des données</h2>
              <p className="text-gray-700 leading-relaxed">
                Nous conservons vos données personnelles aussi longtemps que votre compte est actif 
                ou selon les obligations légales. Après suppression de votre compte, 
                vos données sont anonymisées ou supprimées dans un délai de 90 jours.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Modifications de la politique</h2>
              <p className="text-gray-700 leading-relaxed">
                Nous pouvons mettre à jour cette politique de confidentialité. 
                Vous serez informé des modifications importantes par email ou via une notification sur la plateforme.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contact</h2>
              <p className="text-gray-700 leading-relaxed">
                Pour toute question concernant vos données personnelles ou pour exercer vos droits, contactez-nous à : 
                <a href="mailto:privacy@kplonwe.com" className="text-primary-600 hover:underline ml-1">
                  privacy@kplonwe.com
                </a>
              </p>
            </section>

          </div>

          {/* Footer notice */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <Shield className="text-blue-600 flex-shrink-0 mt-1" size={20} />
            <p className="text-sm text-blue-900">
              Votre vie privée est notre priorité. Nous nous engageons à protéger vos données personnelles 
              et à respecter la réglementation en vigueur.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
