import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/swal.css'
import App from './App.tsx'
import { HelmetProvider } from "react-helmet-async"
import {ThemeProvider} from "./contexts/ThemeContext.tsx";
import {HeaderTitleProvider} from "./contexts/HeaderTitleContext.tsx";
import {AuthProvider} from "./contexts/AuthContext.tsx";
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from "./utils/queryClient.ts";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <QueryClientProvider client={queryClient}>
          <AuthProvider>
              <HelmetProvider>
                  <HeaderTitleProvider>
                      <ThemeProvider>
                          <App />
                      </ThemeProvider>
                  </HeaderTitleProvider>
              </HelmetProvider>
          </AuthProvider>
      </QueryClientProvider>
  </StrictMode>,
)
