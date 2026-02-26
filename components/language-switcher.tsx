'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('language');

  const switchLocale = (newLocale: string) => {
    // Use next-intl's router which handles locale switching automatically
    router.replace(pathname, { locale: newLocale as 'zh' | 'en' });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={locale === 'zh' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchLocale('zh')}
        className="min-w-[60px]"
      >
        {t('zh')}
      </Button>
      <Button
        variant={locale === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchLocale('en')}
        className="min-w-[60px]"
      >
        {t('en')}
      </Button>
    </div>
  );
}
