import React from 'react';
import type { MenuItem } from './index';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  menu?: MenuItem[];
  loading?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  menu = [],
  loading = false,
}) => {
  const showHeader = title || menu.length > 0;

  if (!showHeader) return null;

  return (
    <div className="table-header">
      {title && (
        <div className="title-section">
          <h2>{title}</h2>
          {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>
      )}
      {menu.length > 0 && (
        <div className="actions">
          {menu.map((item) => {
            const isRefreshing = loading && item.id === 'refresh';
            
            return (
              <button
                key={item.id}
                onClick={item.action}
                disabled={item.disabled || loading}
              >
                <span className={isRefreshing ? 'spinning' : ''}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Header;