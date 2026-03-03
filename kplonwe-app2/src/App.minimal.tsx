function AppMinimal() {
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'system-ui',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#10b981', fontSize: '32px', marginBottom: '20px' }}>
        ✅ KPLONWE - L'application fonctionne !
      </h1>
      
      <div style={{ 
        backgroundColor: '#f0fdf4', 
        border: '2px solid #10b981',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: '0 0 10px 0' }}>🎉 Succès</h2>
        <p>Si vous voyez ce message, React fonctionne correctement.</p>
      </div>

      <div style={{ 
        backgroundColor: '#fef3c7', 
        border: '2px solid #f59e0b',
        padding: '20px',
        borderRadius: '8px'
      }}>
        <h2 style={{ margin: '0 0 10px 0' }}>🔍 Diagnostic</h2>
        <p><strong>Le problème est dans:</strong></p>
        <ul>
          <li>Les routes de l'application (routes/index.tsx)</li>
          <li>Un des composants chargés (dashboards, pages)</li>
          <li>Les contextes (AuthContext, etc.)</li>
        </ul>
        
        <h3 style={{ marginTop: '20px' }}>📝 Prochaines étapes:</h3>
        <ol>
          <li>Ouvrir la console navigateur (F12)</li>
          <li>Regarder les erreurs en ROUGE</li>
          <li>Me donner le message d'erreur exact</li>
        </ol>
      </div>
    </div>
  );
}

export default AppMinimal;
