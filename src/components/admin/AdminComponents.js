import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const AdminCard = ({ title, children, className = '' }) => {
  return (
    <div className={classNames(
      "overflow-hidden shadow-sm rounded-xl bg-cb-card border border-cb-border",
      className
    )}>
      <div className="p-6">
        {title && (
          <h3 className="text-lg font-semibold mb-4 text-cb-text-primary">
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
};

export const AdminButton = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 transition-colors duration-200';
  // Cultura Builder Hub Colors
  const variants = {
    primary: 'bg-cb-primary text-white hover:bg-cb-primary-dark focus:ring-cb-primary',
    secondary: 'bg-cb-hover text-cb-text-primary hover:bg-cb-border focus:ring-cb-border',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
  };
  
  return (
    <button className={`${baseClasses} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const AdminTable = ({ headers, children, className = '' }) => {
  return (
    <div className={classNames("overflow-x-auto", className)}>
      <table className="min-w-full divide-y divide-cb-border">
        {headers && (
          <thead className="bg-cb-card">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-cb-text-secondary"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-cb-border bg-cb-card">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export const AdminTableRow = ({ children, className = '', onClick }) => {
  return (
    <tr
      onClick={onClick}
      className={classNames(
        onClick ? "cursor-pointer" : "",
        "hover:bg-cb-hover transition-colors duration-200",
        className
      )}
    >
      {children}
    </tr>
  );
};

export const AdminTableCell = ({ children, className = '' }) => {
  return (
    <td className={classNames(
      "px-6 py-4 whitespace-nowrap text-sm text-cb-text-primary",
      className
    )}>
      {children}
    </td>
  );
};

export const AdminModal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full'
  };
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={classNames(
                "w-full transform overflow-hidden rounded-2xl text-left align-middle shadow-xl transition-all",
                sizeClasses[size],
                "bg-cb-card"
              )}>
                {title && (
                  <div className="flex items-center justify-between px-6 py-4 border-b border-cb-border">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium text-cb-text-primary"
                    >
                      {title}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="rounded-md p-1 text-cb-text-secondary hover:text-cb-text-primary hover:bg-cb-hover transition-colors duration-200"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
                <div className="px-6 py-4 text-cb-text-primary">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export const AdminBadge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-cb-hover text-cb-text-primary',
    success: 'bg-green-800/30 text-green-200',
    danger: 'bg-red-800/30 text-red-200',
    warning: 'bg-yellow-800/30 text-yellow-200',
    info: 'bg-blue-800/30 text-blue-200',
    primary: 'bg-cb-primary/30 text-cb-primary'
  };
  
  return (
    <span className={classNames(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      variants[variant] || variants.default,
      className
    )}>
      {children}
    </span>
  );
};

export const AdminInput = ({ label, error, className = '', ...props }) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium mb-1 text-cb-text-primary">
          {label}
        </label>
      )}
      <input
        className={classNames(
          "block w-full rounded-md border shadow-sm focus:ring-2 focus:ring-offset-0 sm:text-sm transition-colors duration-200",
          "bg-cb-input border-cb-border text-cb-text-primary placeholder:text-cb-text-muted",
          "focus:border-cb-primary focus:ring-cb-primary",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500"
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export const AdminSelect = ({ label, error, className = '', children, ...props }) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium mb-1 text-cb-text-primary">
          {label}
        </label>
      )}
      <select
        className={classNames(
          "block w-full rounded-md border shadow-sm focus:ring-2 focus:ring-offset-0 sm:text-sm transition-colors duration-200",
          "bg-cb-input border-cb-border text-cb-text-primary",
          "focus:border-cb-primary focus:ring-cb-primary",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500"
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export const AdminTextarea = ({ label, error, className = '', ...props }) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium mb-1 text-cb-text-primary">
          {label}
        </label>
      )}
      <textarea
        className={classNames(
          "block w-full rounded-md border shadow-sm focus:ring-2 focus:ring-offset-0 sm:text-sm transition-colors duration-200",
          "bg-cb-input border-cb-border text-cb-text-primary placeholder:text-cb-text-muted",
          "focus:border-cb-primary focus:ring-cb-primary",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500"
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

