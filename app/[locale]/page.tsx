import { auth } from '@/lib/auth/config';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { handleSignOut } from '@/app/actions/auth';
import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/language-switcher';

export const runtime = 'edge';

export default async function Home() {
  const session = await auth();
  const t = await getTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50/30">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-green-700 tracking-tight">
              {t('common.companyName')}
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
              >
                {t('nav.home')}
              </Link>
              <Link
                href="#company"
                className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
              >
                {t('nav.company')}
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
              >
                {t('nav.about')}
              </Link>
              <Link
                href="#recruit"
                className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
              >
                {t('nav.recruit')}
              </Link>
              <LanguageSwitcher />
              {session?.user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{session.user.email}</span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard">{t('nav.dashboard')}</Link>
                  </Button>
                  <form action={handleSignOut}>
                    <Button type="submit" variant="ghost" size="sm">
                      {t('nav.signOut')}
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">{t('nav.login')}</Link>
                  </Button>
                  <Button size="sm" asChild className="bg-green-600 hover:bg-green-700 text-white">
                    <Link href="/register">{t('nav.register')}</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                asChild
                className="rounded-full px-8 py-6 text-lg bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl hover:shadow-green-500/50 transition-all duration-300"
              >
                <Link href="/register">{t('home.hero.cta.primary')}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-full px-8 py-6 text-lg border-2 border-green-600 text-green-600 hover:bg-green-50 transition-all duration-300"
              >
                <Link href="#about">{t('home.hero.cta.secondary')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Business Section */}
      <section id="business" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
              {t('home.business.title')}
            </h2>
            <p className="text-xl text-green-600 font-semibold mb-6">
              {t('home.business.subtitle')}
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('home.business.description')}
            </p>
          </div>

          {/* Features Grid - 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white border border-green-100 rounded-2xl p-8 hover:shadow-xl hover:shadow-green-100/50 transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t('home.business.features.residential.title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('home.business.features.residential.description')}
              </p>
            </div>

            <div className="bg-white border border-green-100 rounded-2xl p-8 hover:shadow-xl hover:shadow-green-100/50 transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t('home.business.features.isp.title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('home.business.features.isp.description')}
              </p>
            </div>

            <div className="bg-white border border-green-100 rounded-2xl p-8 hover:shadow-xl hover:shadow-green-100/50 transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t('home.business.features.dual.title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('home.business.features.dual.description')}
              </p>
            </div>
          </div>

          {/* Dual ISP Description */}
          <div className="mt-16 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-12 border border-green-100">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.business.dualIsp.title')}
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t('home.business.dualIsp.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Company Section */}
      <section id="company" className="py-24 md:py-32 bg-gradient-to-b from-white to-green-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
              {t('home.company.title')}
            </h2>
          </div>
          <div className="max-w-4xl mx-auto space-y-8">
            <p className="text-lg text-gray-700 leading-relaxed text-center">
              {t('home.company.description')}
            </p>
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('home.company.mission')}
                </h3>
                <p className="text-gray-600 leading-relaxed">{t('home.company.missionText')}</p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('home.company.values')}
                </h3>
                <p className="text-gray-600 leading-relaxed">{t('home.company.valuesText')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
              {t('home.about.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('home.about.description')}
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              {t('home.about.advantages.title')}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {(['0', '1', '2', '3'] as const).map(index => (
                <div
                  key={index}
                  className="bg-white border border-green-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {t(`home.about.advantages.items.${index}.title`)}
                  </h4>
                  <p className="text-gray-600">
                    {t(`home.about.advantages.items.${index}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recruit Section */}
      <section id="recruit" className="py-24 md:py-32 bg-gradient-to-b from-green-50/30 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
              {t('home.recruit.title')}
            </h2>
            <p className="text-xl text-green-600 font-semibold mb-6">
              {t('home.recruit.subtitle')}
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('home.recruit.description')}
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              {t('home.recruit.benefits.title')}
            </h3>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {(['0', '1', '2', '3'] as const).map(index => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm border border-green-100 hover:shadow-lg transition-all duration-300"
                >
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {t(`home.recruit.benefits.items.${index}.title`)}
                  </h4>
                  <p className="text-gray-600">
                    {t(`home.recruit.benefits.items.${index}.description`)}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Button
                size="lg"
                asChild
                className="rounded-full px-8 py-6 text-lg bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl hover:shadow-green-500/50 transition-all duration-300"
              >
                <Link href="/register">{t('home.recruit.cta')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('footer.companyName')}</h3>
              <p className="text-sm text-gray-600">{t('footer.description')}</p>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="/privacy" className="hover:text-green-600 transition-colors">
                {t('footer.privacy')}
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-green-600 transition-colors">
                {t('footer.terms')}
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} {t('footer.companyName')}. {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
