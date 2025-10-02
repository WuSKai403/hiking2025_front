import SafetyForm from './components/SafetyForm';
import './index.css'; // 確保引入 Tailwind CSS

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
      <SafetyForm />
    </div>
  );
}

export default App;