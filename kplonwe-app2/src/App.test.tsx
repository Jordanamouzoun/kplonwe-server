import { BrowserRouter } from 'react-router-dom';

function AppTest() {
  return (
    <BrowserRouter>
      <div style={{ padding: '20px' }}>
        <h1>🔍 TEST - Application fonctionne</h1>
        <p>Si vous voyez ce message, l'application se charge correctement.</p>
        <p>Le problème est dans les routes ou les composants.</p>
      </div>
    </BrowserRouter>
  );
}

export default AppTest;
