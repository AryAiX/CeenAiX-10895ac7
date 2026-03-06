import React from 'react';
import { ChatbotButton } from './ChatbotButton';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      {children}
      <ChatbotButton />
    </>
  );
};
