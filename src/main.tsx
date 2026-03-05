import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/swal.css'
import App from './App.tsx'
import { HelmetProvider } from "react-helmet-async"
import {ThemeProvider} from "./contexts/ThemeContext.tsx";
import {HeaderTitleProvider} from "./contexts/HeaderTitleContext.tsx";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <HelmetProvider>
          <HeaderTitleProvider>
              <ThemeProvider>
                  <App />
              </ThemeProvider>
          </HeaderTitleProvider>
      </HelmetProvider>
  </StrictMode>,
)
