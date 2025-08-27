import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PersonalizableDashboard from '../PersonalizableDashboard';

// Mock the theme context
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: '#3b82f6',
        background: '#ffffff',
        text: '#000000',
        textSecondary: '#6b7280',
      },
    },
  }),
}));

// Mock the Button component
jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

// Mock the Card components
jest.mock('@/components/ui/Card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

// Mock the LoadingSpinner component
jest.mock('@/components/ui/Loading', () => ({
  LoadingSpinner: ({ size }: any) => <div data-testid="loading-spinner">Loading...</div>,
}));

describe('PersonalizableDashboard', () => {
  it('renders dashboard title', () => {
    render(<PersonalizableDashboard />);
    expect(screen.getByText('Mi Dashboard')).toBeInTheDocument();
  });

  it('renders dashboard subtitle', () => {
    render(<PersonalizableDashboard />);
    expect(screen.getByText('Personaliza tu vista de EventConnect')).toBeInTheDocument();
  });

  it('shows personalizar button by default', () => {
    render(<PersonalizableDashboard />);
    expect(screen.getByText('Personalizar')).toBeInTheDocument();
  });

  it('shows edit mode when personalizar button is clicked', () => {
    render(<PersonalizableDashboard />);
    
    const personalizarButton = screen.getByText('Personalizar');
    fireEvent.click(personalizarButton);
    
    expect(screen.getByText('Ver Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Agregar Widget')).toBeInTheDocument();
    expect(screen.getByText('Guardar')).toBeInTheDocument();
  });

  it('shows edit mode notice when in edit mode', () => {
    render(<PersonalizableDashboard />);
    
    const personalizarButton = screen.getByText('Personalizar');
    fireEvent.click(personalizarButton);
    
    expect(screen.getByText('Modo de Edición Activado')).toBeInTheDocument();
  });

  it('renders default widgets', () => {
    render(<PersonalizableDashboard />);
    
    // Check that widgets are rendered (there might be multiple instances)
    const eventosElements = screen.getAllByText('Próximos Eventos');
    expect(eventosElements.length).toBeGreaterThan(0);
    
    const statsElements = screen.getAllByText('Mis Estadísticas');
    expect(statsElements.length).toBeGreaterThan(0);
    
    const mapElements = screen.getAllByText('Eventos Cerca');
    expect(mapElements.length).toBeGreaterThan(0);
    
    const notificationsElements = screen.getAllByText('Notificaciones');
    expect(notificationsElements.length).toBeGreaterThan(0);
  });

  it('shows widget selector when add widget button is clicked', () => {
    render(<PersonalizableDashboard />);
    
    // Enter edit mode
    const personalizarButton = screen.getByText('Personalizar');
    fireEvent.click(personalizarButton);
    
    // Click add widget button
    const addWidgetButton = screen.getByText('Agregar Widget');
    fireEvent.click(addWidgetButton);
    
    // Check that widget selector modal is shown (there should be 2 elements with this text)
    const addWidgetElements = screen.getAllByText('Agregar Widget');
    expect(addWidgetElements).toHaveLength(2);
    
    // Check that available widgets are shown in the modal
    // Use getAllByText to handle multiple instances
    const eventosElements = screen.getAllByText('Próximos Eventos');
    expect(eventosElements.length).toBeGreaterThan(0);
    
    const statsElements = screen.getAllByText('Estadísticas');
    expect(statsElements.length).toBeGreaterThan(0);
    
    const mapElements = screen.getAllByText('Mapa de Eventos');
    expect(mapElements.length).toBeGreaterThan(0);
    
    const notificationsElements = screen.getAllByText('Notificaciones');
    expect(notificationsElements.length).toBeGreaterThan(0);
    
    const tribesElements = screen.getAllByText('Mis Comunidades');
    expect(tribesElements.length).toBeGreaterThan(0);
    
    const shortcutsElements = screen.getAllByText('Accesos Rápidos');
    expect(shortcutsElements.length).toBeGreaterThan(0);
    
    const trendingElements = screen.getAllByText('Tendencias');
    expect(trendingElements.length).toBeGreaterThan(0);
    
    const calendarElements = screen.getAllByText('Calendario');
    expect(calendarElements.length).toBeGreaterThan(0);
  });
});