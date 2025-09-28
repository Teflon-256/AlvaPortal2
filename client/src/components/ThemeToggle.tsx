import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-9 px-0"
      data-testid="theme-toggle"
      title={theme === 'dark' ? t('lightMode') : t('darkMode')}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">
        {theme === 'dark' ? t('lightMode') : t('darkMode')}
      </span>
    </Button>
  );
}