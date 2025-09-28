import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <div className="relative">
      <Dashboard />
      <div className="fixed bottom-0 right-0 p-2 text-xs text-gray-200">
       📚💻 Made by Aman,Devendra,Deepika,Deepanshi
      </div>
    </div>
  );
}

export default App;