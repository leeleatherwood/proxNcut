'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { DeckService, deckService } from './deck-service';
import { MachineService, machineService } from './machine-service';

interface ServiceContextType {
  deckService: DeckService;
  machineService: MachineService;
}

const ServiceContext = createContext<ServiceContextType | null>(null);

export function ServiceProvider({ children }: { children: ReactNode }) {
  return (
    <ServiceContext.Provider value={{ deckService, machineService }}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
}
