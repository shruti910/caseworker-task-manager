import React from 'react';

interface HeaderProps {
  onCreateTaskClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCreateTaskClick }) => {
  return (
    <header className="govuk-header" role="banner">
      <div className="govuk-header__container">
        <div className="govuk-header__brand">
          <div className="govuk-header__logotype">
            <span className="govuk-header__crown-text">HMCTS</span>
            <span className="govuk-header__department">Digital Technology Services</span>
          </div>
          <div className="govuk-header__service-name">
            Caseworker Task Management System
          </div>
        </div>
        <div className="govuk-header__actions">
          <button
            type="button"
            className="govuk-button govuk-button--primary"
            onClick={onCreateTaskClick}
            data-testid="header-create-task-button"
          >
            Create Task
          </button>
        </div>
      </div>
    </header>
  );
};

