'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter,
  MoreVertical,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';

export interface Column<T = any> {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, item: T) => React.ReactNode;
  formatter?: (value: any) => string;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  sorting?: {
    column: string | null;
    direction: 'asc' | 'desc';
    onSort: (column: string) => void;
  };
  filtering?: {
    filters: Record<string, any>;
    onFilter: (filters: Record<string, any>) => void;
  };
  selection?: {
    selectedItems: string[];
    onSelect: (items: string[]) => void;
    getItemId: (item: T) => string;
  };
  actions?: {
    view?: (item: T) => void;
    edit?: (item: T) => void;
    delete?: (item: T) => void;
    custom?: Array<{
      label: string;
      icon?: React.ReactNode;
      action: (item: T) => void;
      variant?: 'default' | 'danger';
    }>;
  };
  className?: string;
  emptyMessage?: string;
  searchable?: boolean;
  exportable?: boolean;
}

export const DataTable = <T,>({
  data,
  columns,
  loading = false,
  pagination,
  sorting,
  filtering,
  selection,
  actions,
  className = '',
  emptyMessage = 'No hay datos disponibles',
  searchable = true,
  exportable = false
}: DataTableProps<T>) => {
  const [globalSearch, setGlobalSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Global search filter
  const searchableColumns = columns.filter(col => col.filterable !== false);
  const filteredData = useMemo(() => {
    if (!globalSearch) return data;
    
    return data.filter(item =>
      searchableColumns.some(column => {
        const value = item[column.key as keyof T];
        return String(value || '').toLowerCase().includes(globalSearch.toLowerCase());
      })
    );
  }, [data, globalSearch, searchableColumns]);

  // Handle row selection
  const handleSelectAll = (checked: boolean) => {
    if (!selection) return;
    
    if (checked) {
      const allIds = filteredData.map(item => selection.getItemId(item));
      setSelectedRows(allIds);
      selection.onSelect(allIds);
    } else {
      setSelectedRows([]);
      selection.onSelect([]);
    }
  };

  const handleSelectRow = (itemId: string, checked: boolean) => {
    if (!selection) return;
    
    const newSelection = checked
      ? [...selectedRows, itemId]
      : selectedRows.filter(id => id !== itemId);
    
    setSelectedRows(newSelection);
    selection.onSelect(newSelection);
  };

  const isAllSelected = selection && selectedRows.length === filteredData.length && filteredData.length > 0;
  const isIndeterminate = selection && selectedRows.length > 0 && selectedRows.length < filteredData.length;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden ${className}`}>
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Tabla de Datos
            </h3>
            {selection && selectedRows.length > 0 && (
              <Badge variant="primary">
                {selectedRows.length} seleccionados
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}
            
            {filtering && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            )}
            
            {exportable && (
              <Button variant="outline" size="sm">
                Exportar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && filtering && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {columns.filter(col => col.filterable).map(column => (
                <div key={column.key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {column.title}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onChange={(e) => {
                      filtering.onFilter({
                        ...filtering.filters,
                        [column.key]: e.target.value
                      });
                    }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {selection && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = !!isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-${column.align || 'left'} text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && sorting && (
                      <button
                        onClick={() => sorting.onSort(column.key)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        {sorting.column === column.key ? (
                          sorting.direction === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )
                        ) : (
                          <ArrowUpDown className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </th>
              ))}
              
              {actions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  {(selection ? columns.length + 1 : columns.length) + (actions ? 1 : 0) && 
                    Array.from({ length: (selection ? columns.length + 1 : columns.length) + (actions ? 1 : 0) }).map((_, colIndex) => (
                      <td key={colIndex} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                    ))
                  }
                </tr>
              ))
            ) : filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={(selection ? columns.length + 1 : columns.length) + (actions ? 1 : 0)}
                  className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => {
                const itemId = selection?.getItemId(item) || String(index);
                const isSelected = selectedRows.includes(itemId);
                
                return (
                  <motion.tr
                    key={itemId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    {selection && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(itemId, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    
                    {columns.map(column => (
                      <td
                        key={column.key}
                        className={`px-6 py-4 text-${column.align || 'left'} whitespace-nowrap`}
                      >
                        {column.render ? (
                          column.render(item[column.key as keyof T], item)
                        ) : column.formatter ? (
                          column.formatter(item[column.key as keyof T])
                        ) : (
                          String(item[column.key as keyof T] || '')
                        )}
                      </td>
                    ))}
                    
                    {actions && (
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          {actions.view && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => actions.view!(item)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {actions.edit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => actions.edit!(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {actions.delete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => actions.delete!(item)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {actions.custom && actions.custom.length > 0 && (
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} a{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} de{' '}
              {pagination.total} resultados
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
              >
                Anterior
              </Button>
              
              <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                Página {pagination.page} de {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
