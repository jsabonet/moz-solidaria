import { createRoot } from 'react-dom/client'
import TestComponent from './TestComponent.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<TestComponent />);